-- ================================================
-- VERIFICAR E CORRIGIR DADOS NO SUPABASE
-- Execute no SQL Editor do Supabase
-- ================================================

-- 1. VER TODOS OS USUÁRIOS
SELECT id, name, email FROM "User";

-- 2. VER TODOS OS RESTAURANTES E SEUS DONOS
SELECT 
  r.id as restaurant_id,
  r.name as restaurant_name,
  r."userId",
  u.name as owner_name,
  u.email as owner_email
FROM "Restaurant" r
LEFT JOIN "User" u ON r."userId" = u.id;

-- 3. VER QUANTAS CATEGORIAS
SELECT COUNT(*) as total_categorias FROM "Category";

-- 4. VER QUANTOS ITENS DO MENU
SELECT COUNT(*) as total_itens FROM "MenuItem";

-- 5. VER CATEGORIAS COM RESTAURANTE
SELECT 
  c.id,
  c.name as categoria,
  c."restaurantId",
  r.name as restaurante
FROM "Category" c
LEFT JOIN "Restaurant" r ON c."restaurantId" = r.id;

-- 6. VER ITENS COM CATEGORIA E RESTAURANTE
SELECT 
  m.id,
  m.name as item,
  c.name as categoria,
  r.name as restaurante
FROM "MenuItem" m
LEFT JOIN "Category" c ON m."categoryId" = c.id
LEFT JOIN "Restaurant" r ON m."restaurantId" = r.id;

-- ================================================
-- SE OS DADOS ESTIVEREM LÁ MAS SEM VÍNCULO:
-- Execute isso para corrigir (AJUSTE OS IDs):
-- ================================================

-- EXEMPLO: Vincular restaurante ao usuário correto
-- UPDATE "Restaurant" 
-- SET "userId" = 'ID_DO_USUARIO_CORRETO'
-- WHERE id = 'ID_DO_RESTAURANTE';
