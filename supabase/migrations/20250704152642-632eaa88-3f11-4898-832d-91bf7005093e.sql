-- Add parcela and recorrente_id fields to accounts table
ALTER TABLE public.accounts 
ADD COLUMN parcela TEXT,
ADD COLUMN recorrente_id UUID;

-- Create index for recorrente_id to facilitate grouping
CREATE INDEX idx_accounts_recorrente_id ON public.accounts(recorrente_id);

-- Create index for better performance on queries with recorrente_id and parcela
CREATE INDEX idx_accounts_recorrente_parcela ON public.accounts(recorrente_id, parcela);