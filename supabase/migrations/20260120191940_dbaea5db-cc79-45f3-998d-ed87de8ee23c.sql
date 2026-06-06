-- Adicionar coluna type na tabela card_accounts
ALTER TABLE public.card_accounts 
ADD COLUMN type TEXT NOT NULL DEFAULT 'despesa' CHECK (type IN ('receita', 'despesa'));