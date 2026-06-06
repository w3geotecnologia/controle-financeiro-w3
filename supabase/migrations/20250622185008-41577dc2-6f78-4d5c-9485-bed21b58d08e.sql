
-- Função para deletar conta de usuário (apenas admins)
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
  
  -- Deletar dados relacionados primeiro (devido às foreign keys)
  DELETE FROM public.user_usage_control WHERE user_id = target_user_id;
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  -- O usuário será deletado automaticamente devido ao CASCADE
  -- mas vamos fazer isso explicitamente para ter controle
  DELETE FROM auth.users WHERE id = target_user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Função para processar upgrade/downgrade de usuário
CREATE OR REPLACE FUNCTION public.process_user_upgrade(
  target_user_id uuid, 
  new_status text, 
  make_premium boolean DEFAULT false
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  -- Verificar se o status é válido
  IF new_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status. Must be approved or rejected.';
  END IF;
  
  -- Atualizar status da solicitação
  UPDATE public.user_usage_control
  SET 
    upgrade_status = new_status,
    is_premium = CASE WHEN make_premium THEN true ELSE is_premium END,
    is_trial_active = CASE WHEN make_premium THEN false ELSE is_trial_active END,
    updated_at = now()
  WHERE user_id = target_user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Função para atualizar status de usuário diretamente
CREATE OR REPLACE FUNCTION public.update_user_status(
  target_user_id uuid,
  is_premium boolean,
  is_trial_active boolean,
  extend_trial_days integer DEFAULT 0
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  -- Atualizar ou inserir controle de uso do usuário
  INSERT INTO public.user_usage_control (
    user_id, 
    is_premium, 
    is_trial_active,
    trial_end_date
  )
  VALUES (
    target_user_id, 
    is_premium, 
    is_trial_active,
    CASE 
      WHEN extend_trial_days > 0 THEN now() + (extend_trial_days || ' days')::interval
      ELSE now() + INTERVAL '30 days'
    END
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    is_premium = EXCLUDED.is_premium,
    is_trial_active = EXCLUDED.is_trial_active,
    trial_end_date = CASE 
      WHEN extend_trial_days > 0 THEN now() + (extend_trial_days || ' days')::interval
      ELSE user_usage_control.trial_end_date
    END,
    updated_at = now();
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;
