
-- Criar sequência para o ID primeiro
CREATE SEQUENCE IF NOT EXISTS cards_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

-- Criar tabela para cartões de crédito/débito
CREATE TABLE public.cards (
  id bigint NOT NULL DEFAULT nextval('cards_id_seq'::regclass) PRIMARY KEY,
  user_id uuid NOT NULL,
  bank_id bigint REFERENCES public.banks(id),
  card_name text NOT NULL,
  card_number text NOT NULL,
  card_type text NOT NULL DEFAULT 'credito',
  card_brand text NOT NULL,
  holder_name text NOT NULL,
  expiry_date date NOT NULL,
  credit_limit numeric DEFAULT 0,
  current_balance numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  nickname text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Definir o owner da sequência
ALTER SEQUENCE cards_id_seq OWNED BY public.cards.id;

-- Habilitar RLS
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para cartões
CREATE POLICY "Users can view their own cards" 
  ON public.cards 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cards" 
  ON public.cards 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cards" 
  ON public.cards 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cards" 
  ON public.cards 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON public.cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
