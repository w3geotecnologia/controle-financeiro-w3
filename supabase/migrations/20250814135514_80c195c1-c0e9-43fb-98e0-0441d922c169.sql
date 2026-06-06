
-- Adicionar a coluna data_conta na tabela accounts
ALTER TABLE public.accounts ADD COLUMN data_conta date;

-- Adicionar comentários para documentar os campos
COMMENT ON COLUMN public.accounts.data_conta IS 'Data da compra/transação';
COMMENT ON COLUMN public.accounts.due_date IS 'Data de vencimento da conta';
