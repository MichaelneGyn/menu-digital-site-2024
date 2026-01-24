-- ===================================
-- CRIAR SISTEMA DE CHAMADAS DE GARÇOM
-- ===================================

-- 1. Criar ENUM para status das chamadas
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WaiterCallStatus') THEN
    CREATE TYPE "WaiterCallStatus" AS ENUM ('PENDING', 'ATTENDED', 'DISMISSED');
  END IF;
END $$;

-- 2. Criar tabela WaiterCall
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

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS "WaiterCall_restaurantId_status_idx" 
  ON "WaiterCall"("restaurantId", status);

CREATE INDEX IF NOT EXISTS "WaiterCall_createdAt_idx" 
  ON "WaiterCall"("createdAt");

-- 4. Adicionar coluna de configuração no Restaurant (opcional)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Restaurant' AND column_name = 'enableWaiterCall'
  ) THEN
    ALTER TABLE "Restaurant" 
    ADD COLUMN "enableWaiterCall" BOOLEAN DEFAULT true;
  END IF;
END $$;

-- ===================================
-- VERIFICAR CRIAÇÃO
-- ===================================

-- Verificar tabela criada
SELECT COUNT(*) as total_calls FROM "WaiterCall";

-- Verificar enum criado
SELECT typname FROM pg_type WHERE typname = 'WaiterCallStatus';

-- Sucesso!
SELECT '✅ Sistema de Chamadas criado com sucesso!' as status;
