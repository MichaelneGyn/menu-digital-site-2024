-- ============================================
-- QUERY COMPLETA: VER TODOS OS USUÁRIOS
-- ============================================
-- Cole no SQL Editor do Supabase
-- Clique em RUN para executar
-- Clique em "Save" para salvar como favorita

SELECT 
    -- ========================================
    -- DADOS PESSOAIS
    -- ========================================
    u.id AS "ID",
    u.name AS "👤 Nome",
    u.email AS "📧 Email",
    u.whatsapp AS "📱 WhatsApp",
    u.role AS "🔑 Role",
    
    -- ========================================
    -- DADOS DO RESTAURANTE
    -- ========================================
    r.id AS "🏪 ID Restaurante",
    r.name AS "🏪 Nome Restaurante",
    r.slug AS "🔗 Slug",
    r."isActive" AS "✅ Restaurante Ativo",
    r.whatsapp AS "📱 WhatsApp Restaurante",
    r.email AS "📧 Email Restaurante",
    r.city AS "🌆 Cidade",
    r.state AS "🗺️ Estado",
    
    -- ========================================
    -- STATUS DA ASSINATURA
    -- ========================================
    CASE 
        WHEN u."trialEndsAt" > NOW() THEN '🔵 Trial'
        WHEN u."subscriptionStatus" = 'active' THEN '🟢 Ativo'
        WHEN u."subscriptionStatus" = 'canceled' THEN '🔴 Cancelado'
        ELSE '⚫ Inativo'
    END AS "📊 Status",
    
    -- ========================================
    -- DIAS RESTANTES DE TRIAL
    -- ========================================
    CASE 
        WHEN u."trialEndsAt" > NOW() 
        THEN CONCAT(
            CEIL(EXTRACT(EPOCH FROM (u."trialEndsAt" - NOW())) / 86400), 
            ' dias restantes'
        )
        WHEN u."trialEndsAt" IS NULL THEN 'Sem trial'
        ELSE 'Trial expirado'
    END AS "⏰ Trial",
    
    -- ========================================
    -- PLANO E PAGAMENTO
    -- ========================================
    COALESCE(u."subscriptionPlan", 'Trial') AS "💳 Plano",
    u."subscriptionStatus" AS "💰 Status Pagamento",
    
    -- ========================================
    -- DATAS FORMATADAS
    -- ========================================
    TO_CHAR(u."createdAt", 'DD/MM/YYYY HH24:MI:SS') AS "📅 Data Cadastro",
    TO_CHAR(u."trialEndsAt", 'DD/MM/YYYY HH24:MI') AS "⏳ Trial Termina Em",
    TO_CHAR(u."emailVerified", 'DD/MM/YYYY HH24:MI') AS "✉️ Email Verificado Em",
    TO_CHAR(u."updatedAt", 'DD/MM/YYYY HH24:MI') AS "🔄 Última Atualização",
    
    -- ========================================
    -- CONTADORES (útil para análise)
    -- ========================================
    EXTRACT(DAY FROM (NOW() - u."createdAt")) AS "📆 Dias Desde Cadastro",
    
    CASE 
        WHEN u."trialEndsAt" > NOW() 
        THEN CEIL(EXTRACT(EPOCH FROM (u."trialEndsAt" - NOW())) / 86400)
        ELSE 0
    END AS "⏱️ Dias Trial Restantes (Número)"
    
FROM "User" u
LEFT JOIN "Restaurant" r ON r."userId" = u.id
ORDER BY u."createdAt" DESC;

-- ============================================
-- QUERIES EXTRAS ÚTEIS
-- ============================================

-- 1️⃣ VER APENAS USUÁRIOS EM TRIAL
-- SELECT * FROM (
--     [QUERY ACIMA]
-- ) WHERE "📊 Status" = '🔵 Trial';

-- 2️⃣ VER APENAS USUÁRIOS ATIVOS (PAGANDO)
-- SELECT * FROM (
--     [QUERY ACIMA]
-- ) WHERE "📊 Status" = '🟢 Ativo';

-- 3️⃣ VER USUÁRIOS SEM RESTAURANTE
-- SELECT * FROM (
--     [QUERY ACIMA]
-- ) WHERE "🏪 Nome Restaurante" IS NULL;

-- 4️⃣ CONTAR USUÁRIOS POR STATUS
-- SELECT 
--     CASE 
--         WHEN "trialEndsAt" > NOW() THEN '🔵 Trial'
--         WHEN "subscriptionStatus" = 'active' THEN '🟢 Ativo'
--         WHEN "subscriptionStatus" = 'canceled' THEN '🔴 Cancelado'
--         ELSE '⚫ Inativo'
--     END AS "Status",
--     COUNT(*) AS "Total"
-- FROM "User"
-- GROUP BY "Status"
-- ORDER BY "Total" DESC;

-- 5️⃣ VER TRIAL ACABANDO (PRÓXIMOS 7 DIAS)
-- SELECT 
--     name,
--     email,
--     whatsapp,
--     "trialEndsAt",
--     CEIL(EXTRACT(EPOCH FROM ("trialEndsAt" - NOW())) / 86400) AS "dias_restantes"
-- FROM "User"
-- WHERE "trialEndsAt" BETWEEN NOW() AND NOW() + INTERVAL '7 days'
-- ORDER BY "trialEndsAt" ASC;

-- ============================================
-- COMO SALVAR COMO FAVORITA:
-- ============================================
-- 1. Execute a query
-- 2. Clique em "Save" no canto superior direito
-- 3. Dê um nome: "Ver Todos Usuários Completo"
-- 4. Agora você pode acessar rapidamente em "FAVORITES"
