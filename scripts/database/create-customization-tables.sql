-- ══════════════════════════════════════════════════════════════
-- CRIAR TABELAS DE CUSTOMIZAÇÃO (FALTANDO NO SUPABASE!)
-- ══════════════════════════════════════════════════════════════
-- Execute este SQL no Supabase para criar as tabelas faltantes
-- ══════════════════════════════════════════════════════════════

-- 1. Criar tabela CustomizationGroup
CREATE TABLE IF NOT EXISTS "CustomizationGroup" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "isRequired" BOOLEAN NOT NULL DEFAULT false,
  "minSelections" INTEGER NOT NULL DEFAULT 0,
  "maxSelections" INTEGER,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "restaurantId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "CustomizationGroup_restaurantId_fkey" 
    FOREIGN KEY ("restaurantId") 
    REFERENCES "Restaurant"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
);

-- ══════════════════════════════════════════════════════════════

-- 2. Criar tabela CustomizationOption
CREATE TABLE IF NOT EXISTS "CustomizationOption" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "image" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "groupId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "CustomizationOption_groupId_fkey" 
    FOREIGN KEY ("groupId") 
    REFERENCES "CustomizationGroup"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
);

-- ══════════════════════════════════════════════════════════════

-- 3. Criar tabela de relacionamento (Many-to-Many)
CREATE TABLE IF NOT EXISTS "_CustomizationGroupToMenuItem" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL,
  
  CONSTRAINT "_CustomizationGroupToMenuItem_A_fkey" 
    FOREIGN KEY ("A") 
    REFERENCES "CustomizationGroup"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
    
  CONSTRAINT "_CustomizationGroupToMenuItem_B_fkey" 
    FOREIGN KEY ("B") 
    REFERENCES "MenuItem"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
);

-- ══════════════════════════════════════════════════════════════

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS "CustomizationGroup_restaurantId_idx" 
  ON "CustomizationGroup"("restaurantId");

CREATE INDEX IF NOT EXISTS "CustomizationOption_groupId_idx" 
  ON "CustomizationOption"("groupId");

CREATE UNIQUE INDEX IF NOT EXISTS "_CustomizationGroupToMenuItem_AB_unique" 
  ON "_CustomizationGroupToMenuItem"("A", "B");

CREATE INDEX IF NOT EXISTS "_CustomizationGroupToMenuItem_B_index" 
  ON "_CustomizationGroupToMenuItem"("B");

-- ══════════════════════════════════════════════════════════════

-- 5. VERIFICAR se criou tudo
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('CustomizationGroup', 'CustomizationOption', '_CustomizationGroupToMenuItem')
ORDER BY table_name;

-- Deve retornar 3 tabelas!

-- ══════════════════════════════════════════════════════════════

-- 6. Ver estrutura das novas tabelas
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('CustomizationGroup', 'CustomizationOption')
ORDER BY table_name, ordinal_position;

-- ══════════════════════════════════════════════════════════════
