-- Remove a constraint antiga de status
ALTER TABLE public.card_accounts DROP CONSTRAINT IF EXISTS card_accounts_status_check;

-- Adiciona nova constraint incluindo 'recebido'
ALTER TABLE public.card_accounts ADD CONSTRAINT card_accounts_status_check 
  CHECK (status IN ('pendente', 'pago', 'recebido'));