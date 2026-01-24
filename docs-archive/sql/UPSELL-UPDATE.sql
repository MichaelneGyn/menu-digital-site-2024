-- Adicionar campo de descontos à tabela UpsellRule
-- Execute este SQL no Supabase SQL Editor

ALTER TABLE "UpsellRule" 
ADD COLUMN IF NOT EXISTS "productDiscounts" TEXT DEFAULT '{}';

-- Atualizar registros existentes para ter o campo
UPDATE "UpsellRule" 
SET "productDiscounts" = '{}' 
WHERE "productDiscounts" IS NULL;
