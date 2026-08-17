-- =====================================================================
-- Bloqueio de login no BANCO DE DADOS (5 tentativas -> 15 minutos)
-- Executar no SQL Editor do Supabase self-hosted.
-- Como o controle fica no servidor, limpar o localStorage NAO libera.
-- =====================================================================

-- 1) Tabela de controle -------------------------------------------------
create table if not exists public.login_attempts (
  email           text primary key,
  attempts        integer not null default 0,
  locked_until    timestamptz,
  last_attempt_at timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Sem acesso direto pela Data API: tudo passa pelas funcoes abaixo.
revoke all on public.login_attempts from anon, authenticated;
grant all on public.login_attempts to service_role;

alter table public.login_attempts enable row level security;
-- (nenhuma policy: anon/authenticated nao leem nem escrevem direto)

-- 2) Consultar estado do bloqueio --------------------------------------
create or replace function public.check_login_lock(_email text)
returns table (locked boolean, seconds_remaining integer, attempts integer)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r public.login_attempts;
begin
  select * into r
  from public.login_attempts
  where email = lower(trim(_email));

  if r.email is null then
    return query select false, 0, 0;
    return;
  end if;

  if r.locked_until is not null and r.locked_until > now() then
    return query select
      true,
      ceil(extract(epoch from (r.locked_until - now())))::int,
      r.attempts;
  else
    return query select false, 0, coalesce(r.attempts, 0);
  end if;
end;
$$;

-- 3) Registrar falha de login (incrementa e bloqueia no 5o erro) -------
create or replace function public.register_login_failure(_email text)
returns table (locked boolean, seconds_remaining integer, attempts integer)
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(_email));
  v_max   int  := 5;
  v_lock  interval := interval '15 minutes';
  r public.login_attempts;
begin
  insert into public.login_attempts (email, attempts, last_attempt_at, updated_at)
  values (v_email, 1, now(), now())
  on conflict (email) do update
    set attempts = case
          when public.login_attempts.locked_until is not null
               and public.login_attempts.locked_until <= now()
          then 1
          else public.login_attempts.attempts + 1
        end,
        locked_until = case
          when public.login_attempts.locked_until is not null
               and public.login_attempts.locked_until > now()
          then public.login_attempts.locked_until
          else null
        end,
        last_attempt_at = now(),
        updated_at = now()
  returning * into r;

  if (r.locked_until is null or r.locked_until <= now()) and r.attempts >= v_max then
    update public.login_attempts
      set locked_until = now() + v_lock,
          updated_at = now()
      where email = v_email
      returning * into r;
  end if;

  if r.locked_until is not null and r.locked_until > now() then
    return query select
      true,
      ceil(extract(epoch from (r.locked_until - now())))::int,
      r.attempts;
  else
    return query select false, 0, r.attempts;
  end if;
end;
$$;

-- 4) Limpar tentativas apos login bem-sucedido -------------------------
create or replace function public.reset_login_attempts(_email text)
returns void
language sql
volatile
security definer
set search_path = public
as $$
  delete from public.login_attempts where email = lower(trim(_email));
$$;

-- 5) Permissoes de execucao (tela de login usa a role anon) ------------
grant execute on function public.check_login_lock(text)      to anon, authenticated;
grant execute on function public.register_login_failure(text) to anon, authenticated;
grant execute on function public.reset_login_attempts(text)   to anon, authenticated;

-- Desbloqueio manual (admin):
-- delete from public.login_attempts where email = 'usuario@email.com';
