-- ══════════════════════════════════════════════════════════════
-- CORREÇÃO: Sincronizar restaurantId de TODOS os grupos
-- ══════════════════════════════════════════════════════════════
-- Este script corrige grupos de customização que estão com
-- restaurantId incorreto ou NULL
-- ══════════════════════════════════════════════════════════════

-- 1. VERIFICAR grupos com problema
SELECT 
  cg.id,
  cg.name,
  cg."menuItemId",
  cg."restaurantId" as grupo_restaurantId,
  mi."restaurantId" as item_restaurantId,
  CASE 
    WHEN cg."restaurantId" IS NULL THEN '❌ NULL'
    WHEN cg."restaurantId" != mi."restaurantId" THEN '❌ DIFERENTE'
    ELSE '✅ OK'
  END as status
FROM "public"."CustomizationGroup" cg
LEFT JOIN "public"."MenuItem" mi ON cg."menuItemId" = mi.id
WHERE cg."restaurantId" IS NULL 
   OR cg."restaurantId" != mi."restaurantId"
ORDER BY cg.name;

-- ══════════════════════════════════════════════════════════════

-- 2. CORRIGIR TODOS os grupos
-- Atualiza restaurantId baseado no MenuItem
UPDATE "public"."CustomizationGroup" cg
SET "restaurantId" = mi."restaurantId"
FROM "public"."MenuItem" mi
WHERE cg."menuItemId" = mi.id
  AND (cg."restaurantId" IS NULL OR cg."restaurantId" != mi."restaurantId");

-- ══════════════════════════════════════════════════════════════

-- 3. VERIFICAR se todos foram corrigidos
SELECT 
  COUNT(*) as total_grupos,
  COUNT(CASE WHEN cg."restaurantId" = mi."restaurantId" THEN 1 END) as corretos,
  COUNT(CASE WHEN cg."restaurantId" IS NULL THEN 1 END) as com_null,
  COUNT(CASE WHEN cg."restaurantId" != mi."restaurantId" THEN 1 END) as diferentes
FROM "public"."CustomizationGroup" cg
LEFT JOIN "public"."MenuItem" mi ON cg."menuItemId" = mi.id;

-- Resultado esperado:
-- total_grupos = corretos
-- com_null = 0
-- diferentes = 0

-- ══════════════════════════════════════════════════════════════

-- 4. VERIFICAR grupos órfãos (sem MenuItem)
SELECT 
  cg.id,
  cg.name,
  cg."menuItemId",
  cg."restaurantId"
FROM "public"."CustomizationGroup" cg
LEFT JOIN "public"."MenuItem" mi ON cg."menuItemId" = mi.id
WHERE mi.id IS NULL;

-- Se retornar linhas = Grupos órfãos que devem ser deletados!

-- ══════════════════════════════════════════════════════════════

-- 5. DELETAR grupos órfãos (SE HOUVER)
-- ⚠️ CUIDADO: Isso vai deletar grupos sem item vinculado!
-- DELETE FROM "public"."CustomizationGroup"
-- WHERE "menuItemId" NOT IN (SELECT id FROM "public"."MenuItem");

-- ⚠️ DESCOMENTE a linha acima APENAS se tiver certeza!

-- ══════════════════════════════════════════════════════════════

-- 6. RESUMO FINAL
SELECT 
  '✅ CustomizationGroups corrigidos!' as status,
  COUNT(*) as total_grupos,
  COUNT(CASE WHEN "isActive" = true THEN 1 END) as ativos,
  COUNT(DISTINCT "restaurantId") as restaurantes
FROM "public"."CustomizationGroup";

-- ══════════════════════════════════════════════════════════════
