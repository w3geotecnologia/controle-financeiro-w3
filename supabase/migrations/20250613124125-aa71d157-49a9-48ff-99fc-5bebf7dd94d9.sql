
-- Adicionar novos campos à tabela investments
ALTER TABLE public.investments 
ADD COLUMN maturity_date DATE,
ADD COLUMN investor_name TEXT;

-- Permitir que usuários criem seus próprios tipos de investimento
-- (a funcionalidade já existe, mas vamos garantir que as políticas estão corretas)
-- As políticas já existem, então não precisamos recriar
