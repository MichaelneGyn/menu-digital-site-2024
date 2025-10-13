-- ═══════════════════════════════════════════════════════════
-- VERIFICAR SE BANCO ESTÁ SINCRONIZADO COM SCHEMA PRISMA
-- ═══════════════════════════════════════════════════════════
-- Execute este SQL no Supabase ANTES de fazer deploy!
-- ═══════════════════════════════════════════════════════════

-- 1. Verificar colunas da tabela OrderItem
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'OrderItem'
ORDER BY ordinal_position;

-- DEVE ter estas colunas:
-- ✅ id (text)
-- ✅ quantity (integer)
-- ✅ unitPrice (numeric)
-- ✅ totalPrice (numeric)
-- ✅ notes (text, nullable)
-- ✅ customizations (text, nullable) ← ESTA É A CRÍTICA!
-- ✅ orderId (text)
-- ✅ menuItemId (text)

-- ═══════════════════════════════════════════════════════════

-- 2. Verificar se customizations existe
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.columns 
  WHERE table_schema = 'public'
    AND table_name = 'OrderItem'
    AND column_name = 'customizations'
) as "customizations_existe";

-- Resultado:
-- true  = ✅ OK, coluna existe
-- false = ❌ ERRO, precisa adicionar!

-- ═══════════════════════════════════════════════════════════

-- 3. Se customizations_existe = false, execute:
-- ALTER TABLE "public"."OrderItem" 
-- ADD COLUMN "customizations" TEXT;

-- ═══════════════════════════════════════════════════════════
