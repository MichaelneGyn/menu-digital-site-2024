-- ══════════════════════════════════════════════════════════════
-- ATUALIZAR FOTOS DOS PRODUTOS COM IMAGENS MELHORES DO UNSPLASH
-- ══════════════════════════════════════════════════════════════
-- Execute este SQL no Supabase para atualizar fotos dos produtos
-- ══════════════════════════════════════════════════════════════

-- 1. Ver produtos atuais e suas imagens
SELECT id, name, image 
FROM "MenuItem" 
ORDER BY name;

-- ══════════════════════════════════════════════════════════════

-- 2. OPÇÃO A: Atualizar TODOS produtos com fotos aleatórias variadas

-- Pizza
UPDATE "MenuItem" 
SET image = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80&auto=format'
WHERE LOWER(name) LIKE '%pizza%';

-- Burger / Hamburguer
UPDATE "MenuItem" 
SET image = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&auto=format'
WHERE LOWER(name) LIKE '%burger%' 
   OR LOWER(name) LIKE '%hambur%'
   OR LOWER(name) LIKE '%lanche%';

-- Bebidas / Drinks
UPDATE "MenuItem" 
SET image = 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=800&q=80&auto=format'
WHERE LOWER(name) LIKE '%bebida%' 
   OR LOWER(name) LIKE '%suco%'
   OR LOWER(name) LIKE '%refri%'
   OR LOWER(name) LIKE '%coca%'
   OR LOWER(name) LIKE '%drink%';

-- Sobremesas / Doces
UPDATE "MenuItem" 
SET image = 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80&auto=format'
WHERE LOWER(name) LIKE '%sobremesa%' 
   OR LOWER(name) LIKE '%doce%'
   OR LOWER(name) LIKE '%bolo%'
   OR LOWER(name) LIKE '%torta%';

-- Saladas
UPDATE "MenuItem" 
SET image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80&auto=format'
WHERE LOWER(name) LIKE '%salada%';

-- Massas / Pasta
UPDATE "MenuItem" 
SET image = 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80&auto=format'
WHERE LOWER(name) LIKE '%massa%' 
   OR LOWER(name) LIKE '%macarr%'
   OR LOWER(name) LIKE '%espaguete%'
   OR LOWER(name) LIKE '%lasanha%';

-- Sanduíches
UPDATE "MenuItem" 
SET image = 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80&auto=format'
WHERE LOWER(name) LIKE '%sanduiche%' 
   OR LOWER(name) LIKE '%sandwich%';

-- Açaí
UPDATE "MenuItem" 
SET image = 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80&auto=format'
WHERE LOWER(name) LIKE '%açai%' 
   OR LOWER(name) LIKE '%acai%';

-- Tacos / Comida Mexicana
UPDATE "MenuItem" 
SET image = 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80&auto=format'
WHERE LOWER(name) LIKE '%taco%' 
   OR LOWER(name) LIKE '%burrito%'
   OR LOWER(name) LIKE '%nachos%';

-- Sushi / Comida Japonesa
UPDATE "MenuItem" 
SET image = 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80&auto=format'
WHERE LOWER(name) LIKE '%sushi%' 
   OR LOWER(name) LIKE '%sashimi%'
   OR LOWER(name) LIKE '%roll%'
   OR LOWER(name) LIKE '%temaki%';

-- Frango / Chicken
UPDATE "MenuItem" 
SET image = 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80&auto=format'
WHERE LOWER(name) LIKE '%frango%' 
   OR LOWER(name) LIKE '%chicken%'
   OR LOWER(name) LIKE '%galeto%';

-- Carne / Steak
UPDATE "MenuItem" 
SET image = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80&auto=format'
WHERE LOWER(name) LIKE '%carne%' 
   OR LOWER(name) LIKE '%steak%'
   OR LOWER(name) LIKE '%bife%'
   OR LOWER(name) LIKE '%picanha%';

-- ══════════════════════════════════════════════════════════════

-- 3. OPÇÃO B: Atualizar produto ESPECÍFICO por ID

-- Encontre o ID do produto primeiro:
SELECT id, name FROM "MenuItem" WHERE name LIKE '%pizza%';

-- Depois atualize com a foto que quiser:
-- UPDATE "MenuItem" 
-- SET image = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800'
-- WHERE id = 'SEU-ID-AQUI';

-- ══════════════════════════════════════════════════════════════

-- 4. Verificar mudanças
SELECT id, name, image 
FROM "MenuItem" 
ORDER BY name;

-- ══════════════════════════════════════════════════════════════

-- 📸 BANCO DE FOTOS BONITAS DO UNSPLASH:
-- 
-- Pizzas:
-- https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800 (Pizza margherita)
-- https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800 (Pizza rústica)
-- 
-- Burgers:
-- https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800 (Burger gourmet)
-- https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800 (Burger clássico)
--
-- Bebidas:
-- https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=800 (Smoothie)
-- https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800 (Café)
--
-- Sobremesas:
-- https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800 (Pasta variada)
-- https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800 (Bolo)
--
-- E muitas mais em: https://unsplash.com/s/photos/food

-- ══════════════════════════════════════════════════════════════
