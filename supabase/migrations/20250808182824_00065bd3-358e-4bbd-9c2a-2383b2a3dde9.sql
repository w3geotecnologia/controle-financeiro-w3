
-- Atualizar a função para usar a tabela creditcards correta
CREATE OR REPLACE FUNCTION public.update_payment_source_balance_from_accounts()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- INSERÇÃO
  IF TG_OP = 'INSERT' THEN
    IF NEW.payment_source = 'bank' AND NEW.payment_source_id IS NOT NULL AND NEW.status IN ('pago', 'recebido') THEN
      UPDATE public.banks
      SET balance = balance + NEW.amount,
          updated_at = NOW()
      WHERE id = NEW.payment_source_id;

    ELSIF NEW.payment_source = 'card' AND NEW.payment_source_id IS NOT NULL AND NEW.status IN ('pago', 'recebido') THEN
      UPDATE public.creditcards
      SET current_value = current_value + NEW.amount,
          updated_at = NOW()
      WHERE id = NEW.payment_source_id;
    END IF;
    
    RETURN NEW;

  -- ATUALIZAÇÃO
  ELSIF TG_OP = 'UPDATE' THEN
    -- Reverter valor anterior
    IF OLD.payment_source = 'bank' AND OLD.payment_source_id IS NOT NULL AND OLD.status IN ('pago', 'recebido') THEN
      UPDATE public.banks
      SET balance = balance - OLD.amount,
          updated_at = NOW()
      WHERE id = OLD.payment_source_id;

    ELSIF OLD.payment_source = 'card' AND OLD.payment_source_id IS NOT NULL AND OLD.status IN ('pago', 'recebido') THEN
      UPDATE public.creditcards
      SET current_value = current_value - OLD.amount,
          updated_at = NOW()
      WHERE id = OLD.payment_source_id;
    END IF;

    -- Aplicar novo valor
    IF NEW.payment_source = 'bank' AND NEW.payment_source_id IS NOT NULL AND NEW.status IN ('pago', 'recebido') THEN
      UPDATE public.banks
      SET balance = balance + NEW.amount,
          updated_at = NOW()
      WHERE id = NEW.payment_source_id;

    ELSIF NEW.payment_source = 'card' AND NEW.payment_source_id IS NOT NULL AND NEW.status IN ('pago', 'recebido') THEN
      UPDATE public.creditcards
      SET current_value = current_value + NEW.amount,
          updated_at = NOW()
      WHERE id = NEW.payment_source_id;
    END IF;

    RETURN NEW;

  -- REMOÇÃO
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.payment_source = 'bank' AND OLD.payment_source_id IS NOT NULL AND OLD.status IN ('pago', 'recebido') THEN
      UPDATE public.banks
      SET balance = balance - OLD.amount,
          updated_at = NOW()
      WHERE id = OLD.payment_source_id;

    ELSIF OLD.payment_source = 'card' AND OLD.payment_source_id IS NOT NULL AND OLD.status IN ('pago', 'recebido') THEN
      UPDATE public.creditcards
      SET current_value = current_value - OLD.amount,
          updated_at = NOW()
      WHERE id = OLD.payment_source_id;
    END IF;

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$function$;

-- Criar o trigger se não existir
DROP TRIGGER IF EXISTS update_payment_source_balance_trigger ON public.accounts;
CREATE TRIGGER update_payment_source_balance_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payment_source_balance_from_accounts();
