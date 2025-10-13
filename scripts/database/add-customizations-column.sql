-- Adicionar coluna customizations na tabela OrderItem
-- Execute este SQL no Supabase SQL Editor

ALTER TABLE "public"."OrderItem" 
ADD COLUMN IF NOT EXISTS "customizations" TEXT;

-- Verificar se foi adicionada
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'OrderItem'
ORDER BY ordinal_position;
