-- ===================================
-- SETUP COMPLETO DO BANCO DE DADOS
-- Execute TUDO de uma vez no Supabase
-- ===================================

-- ============================================
-- PARTE 1: OrderType (para pedidos de mesa)
-- ============================================

-- 1.1. Criar ENUM OrderType
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrderType') THEN
    CREATE TYPE "OrderType" AS ENUM ('DELIVERY', 'TABLE', 'TAKEOUT');
    RAISE NOTICE '✅ OrderType criado';
  ELSE
    RAISE NOTICE '⚠️  OrderType já existe';
  END IF;
END $$;

-- 1.2. Adicionar coluna orderType na tabela Order
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Order' AND column_name = 'orderType'
  ) THEN
    ALTER TABLE "Order" ADD COLUMN "orderType" "OrderType" DEFAULT 'DELIVERY';
    RAISE NOTICE '✅ Coluna orderType adicionada';
  ELSE
    RAISE NOTICE '⚠️  Coluna orderType já existe';
  END IF;
END $$;

-- 1.3. Adicionar coluna tableId na tabela Order
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Order' AND column_name = 'tableId'
  ) THEN
    ALTER TABLE "Order" ADD COLUMN "tableId" TEXT;
    RAISE NOTICE '✅ Coluna tableId adicionada';
  ELSE
    RAISE NOTICE '⚠️  Coluna tableId já existe';
  END IF;
END $$;

-- 1.4. Criar índices
CREATE INDEX IF NOT EXISTS "Order_orderType_idx" ON "Order"("orderType");
CREATE INDEX IF NOT EXISTS "Order_tableId_idx" ON "Order"("tableId");

-- ============================================
-- PARTE 2: Sistema de Chamadas de Garçom
-- ============================================

-- 2.1. Criar ENUM WaiterCallStatus
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WaiterCallStatus') THEN
    CREATE TYPE "WaiterCallStatus" AS ENUM ('PENDING', 'ATTENDED', 'DISMISSED');
    RAISE NOTICE '✅ WaiterCallStatus criado';
  ELSE
    RAISE NOTICE '⚠️  WaiterCallStatus já existe';
  END IF;
END $$;

-- 2.2. Criar tabela WaiterCall
CREATE TABLE IF NOT EXISTS "WaiterCall" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "restaurantId" TEXT NOT NULL,
  "tableId" TEXT NOT NULL,
  "tableNumber" TEXT NOT NULL,
  status "WaiterCallStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "attendedAt" TIMESTAMP(3),
  
  CONSTRAINT "WaiterCall_restaurantId_fkey" 
    FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"(id) ON DELETE CASCADE,
  CONSTRAINT "WaiterCall_tableId_fkey" 
    FOREIGN KEY ("tableId") REFERENCES "Table"(id) ON DELETE CASCADE
);

-- 2.3. Criar índices para WaiterCall
CREATE INDEX IF NOT EXISTS "WaiterCall_restaurantId_status_idx" 
  ON "WaiterCall"("restaurantId", status);

CREATE INDEX IF NOT EXISTS "WaiterCall_createdAt_idx" 
  ON "WaiterCall"("createdAt");

-- 2.4. Adicionar coluna enableWaiterCall no Restaurant (opcional)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Restaurant' AND column_name = 'enableWaiterCall'
  ) THEN
    ALTER TABLE "Restaurant" ADD COLUMN "enableWaiterCall" BOOLEAN DEFAULT true;
    RAISE NOTICE '✅ Coluna enableWaiterCall adicionada';
  ELSE
    RAISE NOTICE '⚠️  Coluna enableWaiterCall já existe';
  END IF;
END $$;

-- ===================================
-- VERIFICAÇÃO FINAL
-- ===================================

-- Verificar ENUMs criados
SELECT 
  'ENUMs' as tipo,
  typname as nome
FROM pg_type 
WHERE typname IN ('OrderType', 'WaiterCallStatus')
ORDER BY typname;

-- Verificar colunas da Order
SELECT 
  'Order' as tabela,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'Order' 
AND column_name IN ('orderType', 'tableId')
ORDER BY column_name;

-- Verificar tabela WaiterCall
SELECT 
  'WaiterCall' as tabela,
  COUNT(*) as total_chamadas
FROM "WaiterCall";

-- Verificar coluna enableWaiterCall
SELECT 
  'Restaurant' as tabela,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'Restaurant' 
AND column_name = 'enableWaiterCall';

-- ===================================
-- MENSAGEM FINAL
-- ===================================

SELECT '🎉 SETUP COMPLETO DO BANCO DE DADOS FINALIZADO!' as status;
SELECT '✅ OrderType configurado' as item_1;
SELECT '✅ Sistema de Chamadas configurado' as item_2;
SELECT '✅ Índices criados' as item_3;
SELECT '🚀 Agora você pode fazer pedidos e receber chamadas!' as proximos_passos;
