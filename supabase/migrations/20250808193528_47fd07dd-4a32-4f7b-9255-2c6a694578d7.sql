
-- Remover o trigger antigo que está causando duplicação
DROP TRIGGER IF EXISTS update_bank_balance_trigger ON public.accounts;

-- Remover também a função antiga se existir
DROP FUNCTION IF EXISTS public.update_bank_balance_from_accounts();

-- Garantir que apenas o trigger correto esteja ativo
DROP TRIGGER IF EXISTS update_payment_source_balance_trigger ON public.accounts;

-- Recriar o trigger correto
CREATE TRIGGER update_payment_source_balance_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_payment_source_balance_from_accounts();
