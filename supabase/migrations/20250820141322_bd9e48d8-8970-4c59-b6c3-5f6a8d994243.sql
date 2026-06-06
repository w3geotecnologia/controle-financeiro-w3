
-- Adicionar campos de fonte de pagamento na tabela card_accounts
ALTER TABLE public.card_accounts 
ADD COLUMN payment_source text,
ADD COLUMN payment_source_id bigint,
ADD COLUMN payment_source_name text,
ADD COLUMN data_conta date;

-- Definir valor padrão para payment_source como 'card' para registros existentes
UPDATE public.card_accounts SET payment_source = 'card' WHERE payment_source IS NULL;
