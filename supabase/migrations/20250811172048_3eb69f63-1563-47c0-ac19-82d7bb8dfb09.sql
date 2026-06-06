
-- Adicionar campo para armazenar o nome da fonte de pagamento
ALTER TABLE public.accounts 
ADD COLUMN payment_source_name TEXT;

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN public.accounts.payment_source_name IS 'Nome da fonte de pagamento (banco ou cartão) selecionada pelo usuário';
