-- Adicionar suporte a categorias hierárquicas
ALTER TABLE public.categories 
ADD COLUMN parent_id bigint REFERENCES public.categories(id);

-- Adicionar índice para melhor performance
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);

-- Inserir categorias principais de despesas
INSERT INTO public.categories (name, type, color, parent_id) VALUES
-- Despesas principais
('🏠 Moradia', 'despesa', '#DC2626', NULL),
('🍽️ Alimentação', 'despesa', '#EA580C', NULL),
('🚗 Transporte', 'despesa', '#D97706', NULL),
('💡 Contas e Serviços', 'despesa', '#CA8A04', NULL),
('👨‍⚕️ Saúde', 'despesa', '#16A34A', NULL),
('🏫 Educação', 'despesa', '#2563EB', NULL),
('🛍️ Compras', 'despesa', '#7C3AED', NULL),
('🧾 Dívidas e Financiamentos', 'despesa', '#C2410C', NULL),
('💼 Trabalho / Negócios', 'despesa', '#059669', NULL),
('🎉 Lazer', 'despesa', '#0891B2', NULL),
('🐶 Pets', 'despesa', '#65A30D', NULL),
('👶 Crianças', 'despesa', '#DB2777', NULL),
('❓ Outros', 'despesa', '#6B7280', NULL);

-- Inserir categorias principais de receitas
INSERT INTO public.categories (name, type, color, parent_id) VALUES
('💰 Salário', 'receita', '#16A34A', NULL),
('💰 Bicos / Freelance', 'receita', '#059669', NULL),
('💰 Renda de Aluguéis', 'receita', '#0891B2', NULL),
('💰 Rendimentos / Investimentos', 'receita', '#7C3AED', NULL),
('💰 Reembolsos', 'receita', '#2563EB', NULL),
('💰 Venda de Bens', 'receita', '#DC2626', NULL),
('💰 Outros', 'receita', '#6B7280', NULL);

-- Obter IDs das categorias principais para inserir subcategorias
WITH category_ids AS (
  SELECT id, name FROM public.categories WHERE parent_id IS NULL
)
-- Subcategorias de Moradia
INSERT INTO public.categories (name, type, color, parent_id)
SELECT 'Aluguel / Financiamento', 'despesa', '#DC2626', id FROM category_ids WHERE name = '🏠 Moradia'
UNION ALL
SELECT 'Condomínio', 'despesa', '#DC2626', id FROM category_ids WHERE name = '🏠 Moradia'
UNION ALL
SELECT 'Energia elétrica', 'despesa', '#DC2626', id FROM category_ids WHERE name = '🏠 Moradia'
UNION ALL
SELECT 'Água e esgoto', 'despesa', '#DC2626', id FROM category_ids WHERE name = '🏠 Moradia'
UNION ALL
SELECT 'Gás', 'despesa', '#DC2626', id FROM category_ids WHERE name = '🏠 Moradia'
UNION ALL
SELECT 'Internet', 'despesa', '#DC2626', id FROM category_ids WHERE name = '🏠 Moradia'
UNION ALL
SELECT 'Manutenção', 'despesa', '#DC2626', id FROM category_ids WHERE name = '🏠 Moradia'

-- Subcategorias de Alimentação
UNION ALL
SELECT 'Supermercado', 'despesa', '#EA580C', id FROM category_ids WHERE name = '🍽️ Alimentação'
UNION ALL
SELECT 'Restaurantes', 'despesa', '#EA580C', id FROM category_ids WHERE name = '🍽️ Alimentação'
UNION ALL
SELECT 'Delivery / Lanches', 'despesa', '#EA580C', id FROM category_ids WHERE name = '🍽️ Alimentação'

-- Subcategorias de Transporte
UNION ALL
SELECT 'Combustível', 'despesa', '#D97706', id FROM category_ids WHERE name = '🚗 Transporte'
UNION ALL
SELECT 'Transporte público', 'despesa', '#D97706', id FROM category_ids WHERE name = '🚗 Transporte'
UNION ALL
SELECT 'Manutenção do veículo', 'despesa', '#D97706', id FROM category_ids WHERE name = '🚗 Transporte'
UNION ALL
SELECT 'Seguro veicular', 'despesa', '#D97706', id FROM category_ids WHERE name = '🚗 Transporte'
UNION ALL
SELECT 'Estacionamento', 'despesa', '#D97706', id FROM category_ids WHERE name = '🚗 Transporte'

-- Subcategorias de Contas e Serviços
UNION ALL
SELECT 'Luz', 'despesa', '#CA8A04', id FROM category_ids WHERE name = '💡 Contas e Serviços'
UNION ALL
SELECT 'Água', 'despesa', '#CA8A04', id FROM category_ids WHERE name = '💡 Contas e Serviços'
UNION ALL
SELECT 'Gás', 'despesa', '#CA8A04', id FROM category_ids WHERE name = '💡 Contas e Serviços'
UNION ALL
SELECT 'Internet', 'despesa', '#CA8A04', id FROM category_ids WHERE name = '💡 Contas e Serviços'
UNION ALL
SELECT 'Celular', 'despesa', '#CA8A04', id FROM category_ids WHERE name = '💡 Contas e Serviços'
UNION ALL
SELECT 'Streaming / TV', 'despesa', '#CA8A04', id FROM category_ids WHERE name = '💡 Contas e Serviços'

-- Subcategorias de Saúde
UNION ALL
SELECT 'Plano de saúde', 'despesa', '#16A34A', id FROM category_ids WHERE name = '👨‍⚕️ Saúde'
UNION ALL
SELECT 'Consultas médicas', 'despesa', '#16A34A', id FROM category_ids WHERE name = '👨‍⚕️ Saúde'
UNION ALL
SELECT 'Medicamentos', 'despesa', '#16A34A', id FROM category_ids WHERE name = '👨‍⚕️ Saúde'
UNION ALL
SELECT 'Exames', 'despesa', '#16A34A', id FROM category_ids WHERE name = '👨‍⚕️ Saúde'

-- Subcategorias de Educação
UNION ALL
SELECT 'Escola / Faculdade', 'despesa', '#2563EB', id FROM category_ids WHERE name = '🏫 Educação'
UNION ALL
SELECT 'Cursos / Treinamentos', 'despesa', '#2563EB', id FROM category_ids WHERE name = '🏫 Educação'
UNION ALL
SELECT 'Materiais didáticos', 'despesa', '#2563EB', id FROM category_ids WHERE name = '🏫 Educação'

-- Subcategorias de Compras
UNION ALL
SELECT 'Roupas e calçados', 'despesa', '#7C3AED', id FROM category_ids WHERE name = '🛍️ Compras'
UNION ALL
SELECT 'Eletrônicos', 'despesa', '#7C3AED', id FROM category_ids WHERE name = '🛍️ Compras'
UNION ALL
SELECT 'Presentes', 'despesa', '#7C3AED', id FROM category_ids WHERE name = '🛍️ Compras'

-- Subcategorias de Dívidas
UNION ALL
SELECT 'Cartão de crédito', 'despesa', '#C2410C', id FROM category_ids WHERE name = '🧾 Dívidas e Financiamentos'
UNION ALL
SELECT 'Empréstimos', 'despesa', '#C2410C', id FROM category_ids WHERE name = '🧾 Dívidas e Financiamentos'
UNION ALL
SELECT 'Financiamentos', 'despesa', '#C2410C', id FROM category_ids WHERE name = '🧾 Dívidas e Financiamentos'

-- Subcategorias de Trabalho
UNION ALL
SELECT 'Materiais', 'despesa', '#059669', id FROM category_ids WHERE name = '💼 Trabalho / Negócios'
UNION ALL
SELECT 'Ferramentas', 'despesa', '#059669', id FROM category_ids WHERE name = '💼 Trabalho / Negócios'
UNION ALL
SELECT 'Deslocamentos', 'despesa', '#059669', id FROM category_ids WHERE name = '💼 Trabalho / Negócios'

-- Subcategorias de Lazer
UNION ALL
SELECT 'Cinema / Teatro', 'despesa', '#0891B2', id FROM category_ids WHERE name = '🎉 Lazer'
UNION ALL
SELECT 'Viagens', 'despesa', '#0891B2', id FROM category_ids WHERE name = '🎉 Lazer'
UNION ALL
SELECT 'Assinaturas', 'despesa', '#0891B2', id FROM category_ids WHERE name = '🎉 Lazer'

-- Subcategorias de Pets
UNION ALL
SELECT 'Ração', 'despesa', '#65A30D', id FROM category_ids WHERE name = '🐶 Pets'
UNION ALL
SELECT 'Veterinário', 'despesa', '#65A30D', id FROM category_ids WHERE name = '🐶 Pets'
UNION ALL
SELECT 'Acessórios', 'despesa', '#65A30D', id FROM category_ids WHERE name = '🐶 Pets'

-- Subcategorias de Crianças
UNION ALL
SELECT 'Fraldas', 'despesa', '#DB2777', id FROM category_ids WHERE name = '👶 Crianças'
UNION ALL
SELECT 'Roupas', 'despesa', '#DB2777', id FROM category_ids WHERE name = '👶 Crianças'
UNION ALL
SELECT 'Brinquedos', 'despesa', '#DB2777', id FROM category_ids WHERE name = '👶 Crianças'

-- Subcategorias de Outros
UNION ALL
SELECT 'Despesas não classificadas', 'despesa', '#6B7280', id FROM category_ids WHERE name = '❓ Outros';