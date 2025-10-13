-- ========================================
-- LIMPAR DADOS ANTIGOS DO SUPABASE
-- Execute no SQL Editor do Supabase
-- ========================================

-- IMPORTANTE: Isto NÃO deleta sua conta de usuário!
-- Apenas limpa restaurantes, categorias e produtos antigos.

-- 1. Deletar itens de pedidos (dependência de Order e MenuItem)
DELETE FROM "OrderItem";

-- 2. Deletar pedidos
DELETE FROM "Order";

-- 3. Deletar itens do menu
DELETE FROM "MenuItem";

-- 4. Deletar categorias
DELETE FROM "Category";

-- 5. Deletar restaurantes
DELETE FROM "Restaurant";

-- ========================================
-- VERIFICAR SE FOI LIMPO:
-- ========================================

SELECT 'Restaurants' as tabela, COUNT(*)::text as total FROM "Restaurant"
UNION ALL
SELECT 'Categories', COUNT(*)::text FROM "Category"
UNION ALL
SELECT 'MenuItems', COUNT(*)::text FROM "MenuItem"
UNION ALL
SELECT 'Orders', COUNT(*)::text FROM "Order"
UNION ALL
SELECT 'Users (MANTIDO)', COUNT(*)::text FROM "User";

-- Deve retornar:
-- Restaurants: 0
-- Categories: 0
-- MenuItems: 0
-- Orders: 0
-- Users: 1 (você!)

-- ========================================
-- PRONTO! Agora você pode criar seu restaurante
-- pelo dashboard em http://localhost:3001/admin/dashboard
-- ========================================
