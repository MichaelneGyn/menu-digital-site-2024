-- ============================================
-- REMOVER USUÁRIOS DE TESTE DO SUPABASE
-- ============================================
-- Execute este SQL no Supabase SQL Editor

-- 1️⃣ VERIFICAR OS USUÁRIOS DE TESTE ANTES DE DELETAR
SELECT 
    id, 
    email, 
    name, 
    "createdAt"
FROM "User"
WHERE email IN (
    'vituralcardapio@gmail.com',
    'wowzinhodouglas@gmail.com'
);

-- 2️⃣ VERIFICAR RESTAURANTES ASSOCIADOS (serão deletados em cascata)
SELECT 
    r.id,
    r.name,
    r.slug,
    u.email as "ownerEmail"
FROM "Restaurant" r
JOIN "User" u ON r."ownerId" = u.id
WHERE u.email IN (
    'vituralcardapio@gmail.com',
    'wowzinhodouglas@gmail.com'
);

-- 3️⃣ DELETAR OS USUÁRIOS DE TESTE
-- ⚠️ ATENÇÃO: Isso vai deletar TUDO relacionado (restaurantes, pedidos, etc)
DELETE FROM "User"
WHERE email IN (
    'vituralcardapio@gmail.com',
    'wowzinhodouglas@gmail.com'
);

-- 4️⃣ VERIFICAR SE FORAM DELETADOS
SELECT COUNT(*) as "usuarios_restantes"
FROM "User"
WHERE email IN (
    'vituralcardapio@gmail.com',
    'wowzinhodouglas@gmail.com'
);
-- Deve retornar 0

-- ============================================
-- VERIFICAR NOTIFICAÇÕES
-- ============================================

-- 5️⃣ VERIFICAR SE A TABELA AdminNotification EXISTE
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'AdminNotification'
) as "tabela_existe";

-- 6️⃣ VER TODAS AS NOTIFICAÇÕES
SELECT 
    id,
    type,
    title,
    message,
    read,
    "createdAt",
    "userId",
    "restaurantId"
FROM "AdminNotification"
ORDER BY "createdAt" DESC
LIMIT 20;

-- 7️⃣ CONTAR NOTIFICAÇÕES NÃO LIDAS
SELECT COUNT(*) as "notificacoes_nao_lidas"
FROM "AdminNotification"
WHERE read = false;

-- ============================================
-- TESTAR CRIAÇÃO DE NOTIFICAÇÃO MANUAL
-- ============================================

-- 8️⃣ CRIAR UMA NOTIFICAÇÃO DE TESTE
-- (Substitua 'SEU_RESTAURANT_ID' por um ID real)
INSERT INTO "AdminNotification" (
    id,
    type,
    title,
    message,
    read,
    "createdAt",
    "restaurantId"
) VALUES (
    gen_random_uuid()::text,
    'TEST',
    '🧪 Teste de Notificação',
    'Se você está vendo isso, as notificações estão funcionando!',
    false,
    NOW(),
    (SELECT id FROM "Restaurant" LIMIT 1) -- Pega o primeiro restaurante
);

-- 9️⃣ VERIFICAR SE A NOTIFICAÇÃO DE TESTE FOI CRIADA
SELECT * FROM "AdminNotification"
WHERE type = 'TEST'
ORDER BY "createdAt" DESC
LIMIT 1;

-- ============================================
-- DIAGNÓSTICO: POR QUE NOTIFICAÇÕES NÃO CHEGAM?
-- ============================================

-- 🔍 Verificar se há erros no trigger/function
SELECT 
    proname as "function_name",
    prosrc as "function_code"
FROM pg_proc
WHERE proname LIKE '%notification%';

-- 🔍 Verificar triggers na tabela User
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'User';

-- ============================================
-- PRONTO! ✅
-- ============================================

-- RESUMO DO QUE FAZER:
-- 1. Execute as queries 1 e 2 para VER os dados antes de deletar
-- 2. Execute a query 3 para DELETAR os usuários de teste
-- 3. Execute as queries 5-7 para VERIFICAR as notificações
-- 4. Execute a query 8 para TESTAR criação manual de notificação
-- 5. Acesse o painel admin e veja se a notificação aparece

-- IMPORTANTE:
-- Se as notificações não aparecerem, o problema pode ser:
-- ❌ Tabela AdminNotification não foi criada (execute SUPABASE-ADMIN-NOTIFICATION.sql)
-- ❌ RLS (Row Level Security) está bloqueando (desabilite RLS na tabela)
-- ❌ Código não está chamando notifyNewSignup() corretamente
