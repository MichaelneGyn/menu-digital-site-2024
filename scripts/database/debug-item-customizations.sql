-- ══════════════════════════════════════════════════════════════
-- DEBUG: Investigar problema com customizações do item cmgqf-bf
-- ══════════════════════════════════════════════════════════════

-- 1. Ver informações do item
SELECT 
  id,
  name,
  "restaurantId",
  "isActive"
FROM "public"."MenuItem"
WHERE id = 'cmgqf-bf';

-- ══════════════════════════════════════════════════════════════

-- 2. Ver grupos de customização desse item
SELECT 
  cg.id,
  cg.name,
  cg."menuItemId",
  cg."restaurantId",
  cg."isActive",
  cg."sortOrder"
FROM "public"."CustomizationGroup" cg
WHERE cg."menuItemId" = 'cmgqf-bf';

-- ══════════════════════════════════════════════════════════════

-- 3. Ver opções dos grupos
SELECT 
  co.id,
  co.name,
  co.price,
  co."customizationGroupId",
  co."isActive",
  cg.name as grupo_nome
FROM "public"."CustomizationOption" co
JOIN "public"."CustomizationGroup" cg ON co."customizationGroupId" = cg.id
WHERE cg."menuItemId" = 'cmgqf-bf';

-- ══════════════════════════════════════════════════════════════

-- 4. Verificar se há grupos sem restaurantId (PROBLEMA!)
SELECT 
  cg.id,
  cg.name,
  cg."menuItemId",
  cg."restaurantId",
  mi."restaurantId" as item_restaurantId
FROM "public"."CustomizationGroup" cg
LEFT JOIN "public"."MenuItem" mi ON cg."menuItemId" = mi.id
WHERE cg."menuItemId" = 'cmgqf-bf'
  AND (cg."restaurantId" IS NULL OR cg."restaurantId" != mi."restaurantId");

-- Se retornar linhas = PROBLEMA ENCONTRADO!

-- ══════════════════════════════════════════════════════════════

-- 5. CORRIGIR: Atualizar restaurantId dos grupos órfãos
UPDATE "public"."CustomizationGroup" cg
SET "restaurantId" = mi."restaurantId"
FROM "public"."MenuItem" mi
WHERE cg."menuItemId" = mi.id
  AND cg."menuItemId" = 'cmgqf-bf'
  AND (cg."restaurantId" IS NULL OR cg."restaurantId" != mi."restaurantId");

-- ══════════════════════════════════════════════════════════════

-- 6. Verificar se corrigiu
SELECT 
  cg.id,
  cg.name,
  cg."restaurantId",
  mi."restaurantId" as item_restaurantId,
  CASE 
    WHEN cg."restaurantId" = mi."restaurantId" THEN '✅ OK'
    ELSE '❌ ERRO'
  END as status
FROM "public"."CustomizationGroup" cg
JOIN "public"."MenuItem" mi ON cg."menuItemId" = mi.id
WHERE cg."menuItemId" = 'cmgqf-bf';

-- Todos devem mostrar ✅ OK

-- ══════════════════════════════════════════════════════════════
