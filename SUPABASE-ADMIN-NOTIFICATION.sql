-- ============================================
-- CRIAR TABELA AdminNotification NO SUPABASE
-- ============================================
-- Execute este SQL no Supabase SQL Editor

-- 1. Criar a tabela AdminNotification
CREATE TABLE IF NOT EXISTS "AdminNotification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "restaurantId" TEXT NOT NULL,

    CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("id")
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS "AdminNotification_restaurantId_idx" ON "AdminNotification"("restaurantId");
CREATE INDEX IF NOT EXISTS "AdminNotification_read_idx" ON "AdminNotification"("read");
CREATE INDEX IF NOT EXISTS "AdminNotification_createdAt_idx" ON "AdminNotification"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "AdminNotification_type_idx" ON "AdminNotification"("type");

-- 3. Adicionar foreign key para Restaurant
ALTER TABLE "AdminNotification" 
ADD CONSTRAINT "AdminNotification_restaurantId_fkey" 
FOREIGN KEY ("restaurantId") 
REFERENCES "Restaurant"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- 4. Adicionar foreign key para User (opcional)
ALTER TABLE "AdminNotification" 
ADD CONSTRAINT "AdminNotification_userId_fkey" 
FOREIGN KEY ("userId") 
REFERENCES "User"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- 5. Verificar se a tabela foi criada
SELECT * FROM "AdminNotification" LIMIT 1;

-- ============================================
-- PRONTO! Tabela criada com sucesso! ✅
-- ============================================

-- COMO USAR:
-- 1. Abra o Supabase Dashboard
-- 2. Vá em "SQL Editor"
-- 3. Cole este código
-- 4. Clique em "Run"
-- 5. Faça deploy do projeto novamente
