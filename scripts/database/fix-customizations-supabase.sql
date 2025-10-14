-- ══════════════════════════════════════════════════════════════
-- CORREÇÃO: Descobrir nome correto das tabelas e corrigir
-- ══════════════════════════════════════════════════════════════

-- PASSO 1: Ver todas as tabelas (copie o nome EXATO!)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ══════════════════════════════════════════════════════════════

-- PASSO 2: Depois de ver o nome, tente uma das opções abaixo:

-- OPÇÃO A: Sem aspas (tente primeiro)
-- UPDATE CustomizationGroup cg
-- SET restaurantId = mi.restaurantId
-- FROM MenuItem mi
-- WHERE cg.menuItemId = mi.id
--   AND (cg.restaurantId IS NULL OR cg.restaurantId != mi.restaurantId);

-- ══════════════════════════════════════════════════════════════

-- OPÇÃO B: Com aspas duplas (se opção A falhar)
-- UPDATE "CustomizationGroup" cg
-- SET "restaurantId" = mi."restaurantId"
-- FROM "MenuItem" mi
-- WHERE cg."menuItemId" = mi.id
--   AND (cg."restaurantId" IS NULL OR cg."restaurantId" != mi."restaurantId");

-- ══════════════════════════════════════════════════════════════

-- OPÇÃO C: Snake case (se as tabelas tiverem _ underscores)
-- UPDATE customization_group cg
-- SET restaurant_id = mi.restaurant_id
-- FROM menu_item mi
-- WHERE cg.menu_item_id = mi.id
--   AND (cg.restaurant_id IS NULL OR cg.restaurant_id != mi.restaurant_id);

-- ══════════════════════════════════════════════════════════════
