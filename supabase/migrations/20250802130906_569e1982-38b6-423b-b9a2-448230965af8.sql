
-- Adicionar a coluna current_value na tabela cards se não existir
ALTER TABLE public.cards 
ADD COLUMN IF NOT EXISTS current_value numeric DEFAULT 0;

-- Remover a coluna current_balance se existir (para manter consistência)
ALTER TABLE public.cards 
DROP COLUMN IF EXISTS current_balance;

-- Adicionar as colunas payment_source e payment_source_id na tabela accounts se não existirem
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS payment_source text,
ADD COLUMN IF NOT EXISTS payment_source_id bigint;

-- Criar ou atualizar o trigger para atualizar saldo dos cartões
CREATE OR REPLACE FUNCTION public.update_card_balance_from_accounts()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.payment_source = 'card' AND NEW.payment_source_id IS NOT NULL THEN
      IF NEW.status IN ('pago', 'recebido') THEN
        UPDATE public.cards 
        SET current_value = current_value + ABS(NEW.amount), updated_at = NOW()
        WHERE id = NEW.payment_source_id;
      END IF;
    END IF;
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.payment_source = 'card' AND OLD.payment_source_id IS NOT NULL AND OLD.status IN ('pago', 'recebido') THEN
      UPDATE public.cards 
      SET current_value = current_value - ABS(OLD.amount), updated_at = NOW()
      WHERE id = OLD.payment_source_id;
    END IF;
    
    IF NEW.payment_source = 'card' AND NEW.payment_source_id IS NOT NULL AND NEW.status IN ('pago', 'recebido') THEN
      UPDATE public.cards 
      SET current_value = current_value + ABS(NEW.amount), updated_at = NOW()
      WHERE id = NEW.payment_source_id;
    END IF;
    
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.payment_source = 'card' AND OLD.payment_source_id IS NOT NULL AND OLD.status IN ('pago', 'recebido') THEN
      UPDATE public.cards 
      SET current_value = current_value - ABS(OLD.amount), updated_at = NOW()
      WHERE id = OLD.payment_source_id;
    END IF;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$function$;

-- Criar o trigger se não existir
DROP TRIGGER IF EXISTS trigger_update_card_balance_from_accounts ON public.accounts;
CREATE TRIGGER trigger_update_card_balance_from_accounts
  AFTER INSERT OR UPDATE OR DELETE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_card_balance_from_accounts();
