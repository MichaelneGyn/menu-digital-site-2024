-- Execute este SQL no Supabase para verificar os dados

-- Ver quantos restaurantes existem
SELECT id, name, email FROM "User";

-- Ver quantas categorias existem
SELECT id, name, "restaurantId" FROM "Category";

-- Ver quantos itens do menu existem
SELECT id, name, price, "categoryId" FROM "MenuItem";

-- Ver quantos pedidos existem
SELECT id, code, status, total FROM "Order";

-- Se quiser ver tudo de um restaurante específico
-- Substitua 'RESTAURANT_ID' pelo ID do seu restaurante
-- SELECT * FROM "MenuItem" WHERE "restaurantId" = 'RESTAURANT_ID';
