-- ===================================
-- CRIAR ENUM OrderType NO SUPABASE
-- ===================================

-- 1. Criar ENUM OrderType (se não existir)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrderType') THEN
    CREATE TYPE "OrderType" AS ENUM ('DELIVERY', 'TABLE', 'TAKEOUT');
  END IF;
END $$;

-- 2. Verificar se coluna orderType já existe na tabela Order
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Order' AND column_name = 'orderType'
  ) THEN
    -- Adicionar coluna orderType com valor padrão
    ALTER TABLE "Order" 
    ADD COLUMN "orderType" "OrderType" DEFAULT 'DELIVERY';
  END IF;
END $$;

-- 3. Verificar se coluna tableId já existe
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Order' AND column_name = 'tableId'
  ) THEN
    -- Adicionar coluna tableId (nullable)
    ALTER TABLE "Order" 
    ADD COLUMN "tableId" TEXT;
  END IF;
END $$;

-- 4. Criar índice para performance
CREATE INDEX IF NOT EXISTS "Order_orderType_idx" ON "Order"("orderType");
CREATE INDEX IF NOT EXISTS "Order_tableId_idx" ON "Order"("tableId");

-- ===================================
-- VERIFICAR CRIAÇÃO
-- ===================================

-- Verificar enum criado
SELECT typname FROM pg_type WHERE typname = 'OrderType';

-- Verificar colunas criadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Order' 
AND column_name IN ('orderType', 'tableId');

-- Sucesso!
SELECT '✅ OrderType configurado com sucesso!' as status;
