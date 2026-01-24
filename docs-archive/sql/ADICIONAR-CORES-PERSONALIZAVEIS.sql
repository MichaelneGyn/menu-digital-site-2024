-- ========================================
-- ADICIONAR CORES PERSONALIZÁVEIS
-- ========================================
-- Execute este SQL no Supabase SQL Editor
-- ATENÇÃO: Execute linha por linha ou em blocos

-- 1. Adicionar campo para cor do banner/header
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "headerColor" TEXT DEFAULT '#ffffff';

-- 2. Adicionar campo para cor do texto do header
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "headerTextColor" TEXT DEFAULT '#000000';

-- 3. Adicionar campo para cor de fundo da página
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "backgroundColor" TEXT DEFAULT '#f5f5f5';

-- 4. Adicionar campo para cor dos cards
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "cardColor" TEXT DEFAULT '#ffffff';

-- ========================================
-- VERIFICAR CAMPOS
-- ========================================
SELECT 
  id,
  name,
  "primaryColor",
  "secondaryColor",
  "headerColor",
  "headerTextColor",
  "backgroundColor",
  "cardColor"
FROM "Restaurant"
LIMIT 5;

-- ========================================
-- EXEMPLO DE USO
-- ========================================
-- Atualizar cores de um restaurante específico:
/*
UPDATE "Restaurant"
SET 
  "primaryColor" = '#EA1D2C',      -- Cor principal (botões, badges)
  "secondaryColor" = '#FFC107',    -- Cor secundária (destaques)
  "headerColor" = '#EA1D2C',       -- Cor do banner/header
  "headerTextColor" = '#FFFFFF',   -- Cor do texto no header
  "backgroundColor" = '#F5F5F5',   -- Cor de fundo da página
  "cardColor" = '#FFFFFF'          -- Cor dos cards de produtos
WHERE slug = 'seu-restaurante';
*/
