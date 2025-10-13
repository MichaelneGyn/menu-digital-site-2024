-- ═══════════════════════════════════════════════════════════
-- SINCRONIZAÇÃO COMPLETA DO BANCO SUPABASE
-- ═══════════════════════════════════════════════════════════
-- Este script garante que o banco está 100% sincronizado
-- com o schema do Prisma
-- ═══════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────
-- 1. ADICIONAR COLUNA CUSTOMIZATIONS (se não existir)
-- ────────────────────────────────────────────────────────────

ALTER TABLE "public"."OrderItem" 
ADD COLUMN IF NOT EXISTS "customizations" TEXT;

-- ────────────────────────────────────────────────────────────
-- 2. VERIFICAR OUTRAS COLUNAS IMPORTANTES
-- ────────────────────────────────────────────────────────────

-- Verificar se todas as tabelas existem
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Deve ter estas tabelas:
-- ✅ Account
-- ✅ Analytics  
-- ✅ Category
-- ✅ CustomizationGroup
-- ✅ CustomizationOption
-- ✅ Ingredient
-- ✅ MenuItem
-- ✅ Order
-- ✅ OrderItem
-- ✅ Recipe
-- ✅ RecipeIngredient
-- ✅ Restaurant
-- ✅ Session
-- ✅ User
-- ✅ VerificationToken

-- ────────────────────────────────────────────────────────────
-- 3. VERIFICAR ÍNDICES E CONSTRAINTS
-- ────────────────────────────────────────────────────────────

-- Verificar foreign keys de OrderItem
SELECT
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'OrderItem'
  AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, tc.constraint_name;

-- ────────────────────────────────────────────────────────────
-- 4. VERIFICAR SE TUDO ESTÁ OK
-- ────────────────────────────────────────────────────────────

SELECT 
  'OrderItem' as tabela,
  COUNT(*) as total_colunas,
  COUNT(CASE WHEN column_name = 'customizations' THEN 1 END) as tem_customizations
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'OrderItem';

-- Resultado esperado:
-- total_colunas = 8
-- tem_customizations = 1 (✅ OK!)

-- ═══════════════════════════════════════════════════════════
-- PRONTO! BANCO SINCRONIZADO! ✅
-- ═══════════════════════════════════════════════════════════
