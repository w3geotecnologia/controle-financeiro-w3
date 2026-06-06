
-- Criar tabela para instituições de investimento
CREATE TABLE public.investment_institutions (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para tipos de investimento
CREATE TABLE public.investment_types (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- Ex: 'renda_fixa', 'renda_variavel', 'fundos'
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela principal de investimentos
CREATE TABLE public.investments (
  id BIGSERIAL PRIMARY KEY,
  institution_id BIGINT NOT NULL REFERENCES investment_institutions(id) ON DELETE CASCADE,
  type_id BIGINT NOT NULL REFERENCES investment_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  invested_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  current_value NUMERIC(15,2) NOT NULL DEFAULT 0,
  yield_percentage NUMERIC(8,4) DEFAULT 0, -- Rentabilidade em %
  purchase_date DATE NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.investment_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para investment_institutions
CREATE POLICY "Users can view their own investment institutions" 
  ON public.investment_institutions 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own investment institutions" 
  ON public.investment_institutions 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own investment institutions" 
  ON public.investment_institutions 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own investment institutions" 
  ON public.investment_institutions 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Políticas RLS para investment_types
CREATE POLICY "Users can view their own investment types" 
  ON public.investment_types 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own investment types" 
  ON public.investment_types 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own investment types" 
  ON public.investment_types 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own investment types" 
  ON public.investment_types 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Políticas RLS para investments
CREATE POLICY "Users can view their own investments" 
  ON public.investments 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own investments" 
  ON public.investments 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own investments" 
  ON public.investments 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own investments" 
  ON public.investments 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Inserir alguns tipos de investimento padrão
INSERT INTO public.investment_types (name, category, user_id) VALUES 
('Tesouro IPCA+', 'renda_fixa', '00000000-0000-0000-0000-000000000000'),
('CDB', 'renda_fixa', '00000000-0000-0000-0000-000000000000'),
('LCI/LCA', 'renda_fixa', '00000000-0000-0000-0000-000000000000'),
('Ações', 'renda_variavel', '00000000-0000-0000-0000-000000000000'),
('Fundos Imobiliários', 'renda_variavel', '00000000-0000-0000-0000-000000000000'),
('Fundo de Investimento', 'fundos', '00000000-0000-0000-0000-000000000000');
