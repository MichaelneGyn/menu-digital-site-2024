-- Criar tabela CategoryCustomization
CREATE TABLE IF NOT EXISTS "CategoryCustomization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "isCustomizable" BOOLEAN NOT NULL DEFAULT false,
    "hasSizes" BOOLEAN NOT NULL DEFAULT false,
    "hasFlavors" BOOLEAN NOT NULL DEFAULT false,
    "hasExtras" BOOLEAN NOT NULL DEFAULT false,
    "maxFlavors" INTEGER NOT NULL DEFAULT 1,
    "flavorsRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "CategoryCustomization_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CategoryCustomization_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Criar índices
CREATE UNIQUE INDEX "CategoryCustomization_categoryId_restaurantId_key" ON "CategoryCustomization"("categoryId", "restaurantId");
CREATE INDEX "CategoryCustomization_restaurantId_idx" ON "CategoryCustomization"("restaurantId");

-- Criar tabela CustomizationSize
CREATE TABLE IF NOT EXISTS "CustomizationSize" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryCustomizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "CustomizationSize_categoryCustomizationId_fkey" FOREIGN KEY ("categoryCustomizationId") REFERENCES "CategoryCustomization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Criar índice
CREATE INDEX "CustomizationSize_categoryCustomizationId_idx" ON "CustomizationSize"("categoryCustomizationId");

-- Criar tabela CustomizationFlavor
CREATE TABLE IF NOT EXISTS "CustomizationFlavor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryCustomizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "CustomizationFlavor_categoryCustomizationId_fkey" FOREIGN KEY ("categoryCustomizationId") REFERENCES "CategoryCustomization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Criar índice
CREATE INDEX "CustomizationFlavor_categoryCustomizationId_idx" ON "CustomizationFlavor"("categoryCustomizationId");

-- Criar tabela CustomizationExtra
CREATE TABLE IF NOT EXISTS "CustomizationExtra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryCustomizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "CustomizationExtra_categoryCustomizationId_fkey" FOREIGN KEY ("categoryCustomizationId") REFERENCES "CategoryCustomization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Criar índice
CREATE INDEX "CustomizationExtra_categoryCustomizationId_idx" ON "CustomizationExtra"("categoryCustomizationId");
