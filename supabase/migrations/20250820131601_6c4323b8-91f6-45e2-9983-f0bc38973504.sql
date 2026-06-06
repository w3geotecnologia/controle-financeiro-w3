
-- Criar tabela para contas de cartões de crédito
CREATE TABLE IF NOT EXISTS public.card_accounts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  category_id BIGINT NOT NULL REFERENCES public.categories(id),
  card_id BIGINT NOT NULL REFERENCES public.creditcards(id),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.card_accounts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own card accounts" 
  ON public.card_accounts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own card accounts" 
  ON public.card_accounts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own card accounts" 
  ON public.card_accounts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own card accounts" 
  ON public.card_accounts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_card_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_card_accounts_updated_at_trigger
  BEFORE UPDATE ON public.card_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_card_accounts_updated_at();

-- Trigger para controlar saldo do cartão
CREATE OR REPLACE FUNCTION update_card_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- INSERT: adiciona valor à dívida do cartão
  IF TG_OP = 'INSERT' THEN
    UPDATE public.creditcards
    SET current_value = current_value + NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.card_id;
    RETURN NEW;
    
  -- UPDATE: ajusta saldo conforme mudança de status
  ELSIF TG_OP = 'UPDATE' THEN
    -- Se status mudou de pendente para pago
    IF OLD.status = 'pendente' AND NEW.status = 'pago' THEN
      UPDATE public.creditcards
      SET current_value = current_value - NEW.amount,
          updated_at = NOW()
      WHERE id = NEW.card_id;
    -- Se status mudou de pago para pendente  
    ELSIF OLD.status = 'pago' AND NEW.status = 'pendente' THEN
      UPDATE public.creditcards
      SET current_value = current_value + NEW.amount,
          updated_at = NOW()
      WHERE id = NEW.card_id;
    -- Se valor mudou mantendo mesmo status
    ELSIF OLD.amount <> NEW.amount THEN
      IF NEW.status = 'pendente' THEN
        UPDATE public.creditcards
        SET current_value = current_value - OLD.amount + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.card_id;
      ELSIF NEW.status = 'pago' THEN
        UPDATE public.creditcards
        SET current_value = current_value + OLD.amount - NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.card_id;
      END IF;
    END IF;
    RETURN NEW;
    
  -- DELETE: remove valor da dívida do cartão
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status = 'pendente' THEN
      UPDATE public.creditcards
      SET current_value = current_value - OLD.amount,
          updated_at = NOW()
      WHERE id = OLD.card_id;
    END IF;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER card_balance_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.card_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_card_balance();
