-- =====================================================================
-- LOG de tentativas de login com erro / bloqueadas
-- Executar no SQL Editor do Supabase self-hosted (depois de login_lockout.sql)
-- =====================================================================

-- 1) Tabela de log ------------------------------------------------------
create table if not exists public.login_failure_log (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  event       text not null default 'failed',  -- 'failed' | 'blocked'
  attempts    integer not null default 0,
  locked      boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists login_failure_log_created_at_idx
  on public.login_failure_log (created_at desc);
create index if not exists login_failure_log_email_idx
  on public.login_failure_log (lower(email));

-- Sem acesso direto pela Data API: leitura apenas via funcao de admin.
revoke all on public.login_failure_log from anon, authenticated;
grant all on public.login_failure_log to service_role;

alter table public.login_failure_log enable row level security;
-- (nenhuma policy: ninguem le/escreve direto)

-- 2) Registrar falha de login (agora tambem grava no log) ---------------
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
  v_was_locked boolean := false;
begin
  select (la.locked_until is not null and la.locked_until > now())
    into v_was_locked
  from public.login_attempts la
  where la.email = v_email;

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

  insert into public.login_failure_log (email, event, attempts, locked)
  values (
    v_email,
    case
      when r.locked_until is not null and r.locked_until > now() then 'blocked'
      else 'failed'
    end,
    coalesce(r.attempts, 0),
    (r.locked_until is not null and r.locked_until > now())
  );

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

grant execute on function public.register_login_failure(text) to anon, authenticated;

-- 3) Listagem do log para administradores ------------------------------
create or replace function public.list_login_failures(_limit integer default 200)
returns table (
  id uuid,
  email text,
  event text,
  attempts integer,
  locked boolean,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Acesso negado';
  end if;

  return query
    select l.id, l.email, l.event, l.attempts, l.locked, l.created_at
    from public.login_failure_log l
    order by l.created_at desc
    limit greatest(1, least(coalesce(_limit, 200), 1000));
end;
$$;

grant execute on function public.list_login_failures(integer) to authenticated;

-- 4) Limpar o log (admin) ----------------------------------------------
create or replace function public.clear_login_failures()
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Acesso negado';
  end if;
  delete from public.login_failure_log;
end;
$$;

grant execute on function public.clear_login_failures() to authenticated;
