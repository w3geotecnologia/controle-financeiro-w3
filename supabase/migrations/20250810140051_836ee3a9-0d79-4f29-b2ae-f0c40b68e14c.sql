
-- Corrigir a função delete_user_account para deletar diretamente da tabela auth.users
CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Log inicial
  RAISE NOTICE 'Iniciando delete_user_account para usuário: %', target_user_id;
  
  -- Verificar se o usuário atual é admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE NOTICE 'Erro: Usuário % não é admin. Auth.uid(): %', target_user_id, auth.uid();
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  RAISE NOTICE 'Usuário % é admin, continuando...', auth.uid();
  
  -- Não permitir que admin delete a si mesmo
  IF target_user_id = auth.uid() THEN
    RAISE NOTICE 'Erro: Tentativa de auto-deleção pelo usuário %', target_user_id;
    RAISE EXCEPTION 'Cannot delete your own account.';
  END IF;
  
  -- Se o usuário alvo é admin, apenas outros admins podem deletá-lo
  IF public.has_role(target_user_id, 'admin') THEN
    RAISE NOTICE 'Usuário alvo % é admin', target_user_id;
    RAISE EXCEPTION 'Cannot delete administrator accounts.';
  END IF;
  
  -- Verificar se o usuário existe antes de deletar
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RAISE NOTICE 'Erro: Usuário % não encontrado em auth.users', target_user_id;
    RETURN false;
  END IF;
  
  RAISE NOTICE 'Usuário % encontrado, procedendo com deleção...', target_user_id;
  
  -- Deletar dados relacionados primeiro (em ordem para evitar violações de FK)
  DELETE FROM public.user_usage_control WHERE user_id = target_user_id;
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  DELETE FROM public.accounts WHERE user_id = target_user_id;
  DELETE FROM public.banks WHERE user_id = target_user_id;
  DELETE FROM public.cards WHERE user_id = target_user_id;
  DELETE FROM public.creditcards WHERE user_id = target_user_id;
  DELETE FROM public.categories WHERE user_id = target_user_id;
  DELETE FROM public.deposits WHERE user_id = target_user_id;
  DELETE FROM public.investments WHERE user_id = target_user_id;
  DELETE FROM public.investimentos_vencidos WHERE user_id = target_user_id;
  DELETE FROM public.investment_institutions WHERE user_id = target_user_id;
  DELETE FROM public.investment_types WHERE user_id = target_user_id;
  DELETE FROM public.premium_upgrade_requests WHERE user_id = target_user_id;
  
  -- Deletar o usuário da tabela auth.users por último
  DELETE FROM auth.users WHERE id = target_user_id;
  
  -- Verificar se a deleção foi bem-sucedida
  IF NOT FOUND THEN
    RAISE NOTICE 'Erro: DELETE não afetou nenhuma linha para usuário %', target_user_id;
    RETURN false;
  END IF;
  
  RAISE NOTICE 'Usuário % deletado com sucesso', target_user_id;
  
  -- Se chegou até aqui, deu certo
  RETURN true;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro para debug
    RAISE NOTICE 'Exceção ao deletar usuário %: % - %', target_user_id, SQLSTATE, SQLERRM;
    RETURN false;
END;
$function$
