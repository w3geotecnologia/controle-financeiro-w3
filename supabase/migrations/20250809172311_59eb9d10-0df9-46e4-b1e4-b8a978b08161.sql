
-- Criar tabela investimentos_vencidos com a mesma estrutura da tabela investimentos
CREATE TABLE public.investimentos_vencidos (
  id bigint NOT NULL DEFAULT nextval('investments_id_seq'::regclass),
  institution_id bigint NOT NULL,
  type_id bigint NOT NULL,
  name text NOT NULL,
  invested_amount numeric NOT NULL DEFAULT 0,
  current_value numeric NOT NULL DEFAULT 0,
  yield_percentage numeric DEFAULT 0,
  purchase_date date NOT NULL,
  maturity_date date,
  investor_name text,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  moved_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Adicionar RLS (Row Level Security)
ALTER TABLE public.investimentos_vencidos ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para investimentos_vencidos
CREATE POLICY "Users can view their own expired investments" 
  ON public.investimentos_vencidos 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own expired investments" 
  ON public.investimentos_vencidos 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own expired investments" 
  ON public.investimentos_vencidos 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own expired investments" 
  ON public.investimentos_vencidos 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Criar função para mover investimentos vencidos
CREATE OR REPLACE FUNCTION public.move_expired_investments(target_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  moved_count integer := 0;
BEGIN
  -- Verificar se o usuário está autenticado e é o dono dos dados
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;

  -- Inserir investimentos vencidos na nova tabela
  INSERT INTO public.investimentos_vencidos (
    id, institution_id, type_id, name, invested_amount, current_value,
    yield_percentage, purchase_date, maturity_date, investor_name,
    user_id, created_at, updated_at, moved_at
  )
  SELECT 
    id, institution_id, type_id, name, invested_amount, current_value,
    yield_percentage, purchase_date, maturity_date, investor_name,
    user_id, created_at, updated_at, NOW()
  FROM public.investments
  WHERE user_id = target_user_id 
    AND maturity_date IS NOT NULL 
    AND maturity_date <= CURRENT_DATE;

  -- Contar quantos registros foram movidos
  GET DIAGNOSTICS moved_count = ROW_COUNT;

  -- Excluir os investimentos vencidos da tabela original
  DELETE FROM public.investments
  WHERE user_id = target_user_id 
    AND maturity_date IS NOT NULL 
    AND maturity_date <= CURRENT_DATE;

  RETURN moved_count;
END;
$$;
