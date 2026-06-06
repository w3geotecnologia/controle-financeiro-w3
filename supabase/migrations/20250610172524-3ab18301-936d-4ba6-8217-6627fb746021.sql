
-- Criar tabela para bancos
CREATE TABLE public.banks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  agency TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_type TEXT DEFAULT 'corrente',
  nickname TEXT,
  balance NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para depósitos
CREATE TABLE public.deposits (
  id BIGSERIAL PRIMARY KEY,
  bank_id BIGINT REFERENCES public.banks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  amount NUMERIC NOT NULL,
  deposit_date DATE NOT NULL,
  description TEXT,
  origin_bank TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para bancos
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para bancos
CREATE POLICY "Users can view their own banks" 
  ON public.banks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own banks" 
  ON public.banks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own banks" 
  ON public.banks 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own banks" 
  ON public.banks 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Habilitar RLS para depósitos
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para depósitos
CREATE POLICY "Users can view their own deposits" 
  ON public.deposits 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deposits" 
  ON public.deposits 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deposits" 
  ON public.deposits 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deposits" 
  ON public.deposits 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para atualizar o saldo do banco após inserção de depósito
CREATE OR REPLACE FUNCTION update_bank_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.banks 
    SET balance = balance + NEW.amount, updated_at = NOW()
    WHERE id = NEW.bank_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.banks 
    SET balance = balance - OLD.amount, updated_at = NOW()
    WHERE id = OLD.bank_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.banks 
    SET balance = balance - OLD.amount + NEW.amount, updated_at = NOW()
    WHERE id = NEW.bank_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para depósitos
CREATE TRIGGER trigger_update_bank_balance
  AFTER INSERT OR UPDATE OR DELETE ON public.deposits
  FOR EACH ROW
  EXECUTE FUNCTION update_bank_balance();

-- Trigger para atualizar updated_at nas tabelas
CREATE TRIGGER update_banks_updated_at
  BEFORE UPDATE ON public.banks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deposits_updated_at
  BEFORE UPDATE ON public.deposits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
