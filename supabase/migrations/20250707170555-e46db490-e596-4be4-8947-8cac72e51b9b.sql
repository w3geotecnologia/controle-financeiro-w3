
-- Adicionar coluna bank_id na tabela accounts
ALTER TABLE public.accounts 
ADD COLUMN bank_id BIGINT REFERENCES public.banks(id);

-- Criar trigger para atualizar saldo do banco automaticamente
CREATE OR REPLACE FUNCTION public.update_bank_balance_from_accounts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Para nova conta, atualizar saldo do banco
    IF NEW.bank_id IS NOT NULL THEN
      IF NEW.status IN ('pago', 'recebido') THEN
        UPDATE public.banks 
        SET balance = balance + NEW.amount, updated_at = NOW()
        WHERE id = NEW.bank_id;
      END IF;
    END IF;
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Para conta atualizada, recalcular saldo
    IF OLD.bank_id IS NOT NULL AND OLD.status IN ('pago', 'recebido') THEN
      -- Reverter valor anterior
      UPDATE public.banks 
      SET balance = balance - OLD.amount, updated_at = NOW()
      WHERE id = OLD.bank_id;
    END IF;
    
    IF NEW.bank_id IS NOT NULL AND NEW.status IN ('pago', 'recebido') THEN
      -- Aplicar novo valor
      UPDATE public.banks 
      SET balance = balance + NEW.amount, updated_at = NOW()
      WHERE id = NEW.bank_id;
    END IF;
    
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Para conta deletada, reverter saldo
    IF OLD.bank_id IS NOT NULL AND OLD.status IN ('pago', 'recebido') THEN
      UPDATE public.banks 
      SET balance = balance - OLD.amount, updated_at = NOW()
      WHERE id = OLD.bank_id;
    END IF;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger na tabela accounts
CREATE TRIGGER accounts_update_bank_balance
  AFTER INSERT OR UPDATE OR DELETE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_bank_balance_from_accounts();
