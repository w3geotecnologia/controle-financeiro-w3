-- Desfazer sistema de categorias hierárquicas
-- Remover todas as categorias que foram inseridas automaticamente
DELETE FROM public.categories WHERE user_id IS NULL;

-- Remover a coluna parent_id
ALTER TABLE public.categories DROP COLUMN parent_id;

-- Remover o índice relacionado
DROP INDEX IF EXISTS idx_categories_parent_id;