-- Adicionar novas colunas à tabela Order
-- Execute este SQL diretamente no seu banco de dados

-- Adicionar timestamps de status
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "confirmedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "preparingAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "readyAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP(3);

-- Adicionar tempo estimado
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "estimatedTime" INTEGER;

-- Adicionar campos de rastreamento
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "trackingUrl" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "notificationSent" BOOLEAN NOT NULL DEFAULT false;

-- Atualizar status para usar ENUM se ainda for string
-- ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus" USING "status"::"OrderStatus";
