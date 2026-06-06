
-- Atualizar a função de limpeza para ser mais específica
CREATE OR REPLACE FUNCTION public.cleanup_user_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Apenas limpar dados de usuários normais, não de administradores
  -- (A menos que seja um admin deletando outro admin)
  
  -- Verificar se o usuário sendo deletado é um admin
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = OLD.id AND role = 'admin'
  ) THEN
    -- Se é admin, verificar se quem está fazendo a operação também é admin
    IF NOT public.has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Only administrators can delete other administrators.';
    END IF;
  END IF;
  
  -- Deletar dados relacionados ao usuário em todas as tabelas
  DELETE FROM public.user_usage_control WHERE user_id = OLD.id;
  DELETE FROM public.user_roles WHERE user_id = OLD.id;
  DELETE FROM public.accounts WHERE user_id = OLD.id;
  DELETE FROM public.banks WHERE user_id = OLD.id;
  DELETE FROM public.cards WHERE user_id = OLD.id;
  DELETE FROM public.creditcards WHERE user_id = OLD.id;
  DELETE FROM public.categories WHERE user_id = OLD.id;
  DELETE FROM public.deposits WHERE user_id = OLD.id;
  DELETE FROM public.investments WHERE user_id = OLD.id;
  DELETE FROM public.investimentos_vencidos WHERE user_id = OLD.id;
  DELETE FROM public.investment_institutions WHERE user_id = OLD.id;
  DELETE FROM public.investment_types WHERE user_id = OLD.id;
  DELETE FROM public.premium_upgrade_requests WHERE user_id = OLD.id;
  
  RETURN OLD;
END;
$$;

-- Atualizar a função delete_user_account com as novas regras
CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  -- Não permitir que admin delete a si mesmo
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account.';
  END IF;
  
  -- Se o usuário alvo é admin, apenas outros admins podem deletá-lo
  -- (Esta verificação será feita novamente no trigger, mas é boa prática ter aqui também)
  IF public.has_role(target_user_id, 'admin') THEN
    IF NOT public.has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Only administrators can delete other administrators.';
    END IF;
  END IF;
  
  -- Deletar o usuário (o trigger fará a limpeza automaticamente)
  DELETE FROM auth.users WHERE id = target_user_id;
  
  -- Se chegou até aqui, deu certo
  RETURN true;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro para debug
    RAISE NOTICE 'Error deleting user %: %', target_user_id, SQLERRM;
    RETURN false;
END;
$$;
