-- ================================================
-- SCRIPT DE EXPORTAÇÃO - NEON PARA SUPABASE
-- Execute no SQL Editor do NEON
-- ================================================

-- 1. EXPORTAR USUÁRIOS/RESTAURANTES
SELECT 
  'INSERT INTO "User" (id, name, email, "emailVerified", image, "createdAt", "updatedAt") VALUES (' ||
  quote_literal(id) || ', ' ||
  quote_literal(name) || ', ' ||
  quote_literal(email) || ', ' ||
  COALESCE(quote_literal("emailVerified"::text), 'NULL') || ', ' ||
  COALESCE(quote_literal(image), 'NULL') || ', ' ||
  quote_literal("createdAt"::text) || ', ' ||
  quote_literal("updatedAt"::text) || 
  ');'
FROM "User";

-- 2. EXPORTAR RESTAURANTES
SELECT 
  'INSERT INTO "Restaurant" (id, name, "whatsapp", address, "openTime", "closeTime", "workingDays", slug, "pixKey", "pixQrCode", "userId", "createdAt", "updatedAt") VALUES (' ||
  quote_literal(id) || ', ' ||
  quote_literal(name) || ', ' ||
  COALESCE(quote_literal("whatsapp"), 'NULL') || ', ' ||
  COALESCE(quote_literal(address), 'NULL') || ', ' ||
  COALESCE(quote_literal("openTime"), 'NULL') || ', ' ||
  COALESCE(quote_literal("closeTime"), 'NULL') || ', ' ||
  COALESCE(quote_literal("workingDays"), 'NULL') || ', ' ||
  COALESCE(quote_literal(slug), 'NULL') || ', ' ||
  COALESCE(quote_literal("pixKey"), 'NULL') || ', ' ||
  COALESCE(quote_literal("pixQrCode"), 'NULL') || ', ' ||
  quote_literal("userId") || ', ' ||
  quote_literal("createdAt"::text) || ', ' ||
  quote_literal("updatedAt"::text) ||
  ');'
FROM "Restaurant";

-- 3. EXPORTAR CATEGORIAS
SELECT 
  'INSERT INTO "Category" (id, name, icon, "restaurantId", "createdAt", "updatedAt") VALUES (' ||
  quote_literal(id) || ', ' ||
  quote_literal(name) || ', ' ||
  quote_literal(icon) || ', ' ||
  quote_literal("restaurantId") || ', ' ||
  quote_literal("createdAt"::text) || ', ' ||
  quote_literal("updatedAt"::text) ||
  ');'
FROM "Category";

-- 4. EXPORTAR ITENS DO MENU
SELECT 
  'INSERT INTO "MenuItem" (id, name, description, price, image, "isPromo", "originalPrice", "restaurantId", "categoryId", "createdAt", "updatedAt") VALUES (' ||
  quote_literal(id) || ', ' ||
  quote_literal(name) || ', ' ||
  COALESCE(quote_literal(description), 'NULL') || ', ' ||
  price || ', ' ||
  COALESCE(quote_literal(image), 'NULL') || ', ' ||
  "isPromo" || ', ' ||
  COALESCE("originalPrice"::text, 'NULL') || ', ' ||
  quote_literal("restaurantId") || ', ' ||
  quote_literal("categoryId") || ', ' ||
  quote_literal("createdAt"::text) || ', ' ||
  quote_literal("updatedAt"::text) ||
  ');'
FROM "MenuItem";

-- 5. EXPORTAR PEDIDOS (se houver)
SELECT 
  'INSERT INTO "Order" (id, "restaurantId", code, status, total, "createdAt", "updatedAt", "customerName", "customerPhone", "deliveryAddress", "paymentMethod", notes) VALUES (' ||
  quote_literal(id) || ', ' ||
  quote_literal("restaurantId") || ', ' ||
  quote_literal(code) || ', ' ||
  quote_literal(status) || ', ' ||
  total || ', ' ||
  quote_literal("createdAt"::text) || ', ' ||
  quote_literal("updatedAt"::text) || ', ' ||
  COALESCE(quote_literal("customerName"), 'NULL') || ', ' ||
  COALESCE(quote_literal("customerPhone"), 'NULL') || ', ' ||
  COALESCE(quote_literal("deliveryAddress"), 'NULL') || ', ' ||
  COALESCE(quote_literal("paymentMethod"), 'NULL') || ', ' ||
  COALESCE(quote_literal(notes), 'NULL') ||
  ');'
FROM "Order";

-- ================================================
-- INSTRUÇÕES:
-- 1. Acesse Neon Console: https://console.neon.tech
-- 2. Selecione seu projeto
-- 3. Vá em SQL Editor
-- 4. Execute este script SEÇÃO POR SEÇÃO
-- 5. Copie os resultados (são os INSERTs)
-- 6. Cole no Supabase SQL Editor
-- ================================================
