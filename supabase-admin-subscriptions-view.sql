-- VIEW para consolidar dados de assinaturas para o painel administrativo
-- Esta VIEW combina dados de subscriptions, users, profiles e restaurants
-- Inclui cálculos automáticos de status e dias restantes
-- Corrigida com LEFT JOIN e coalesce para evitar erros de email undefined

CREATE OR REPLACE VIEW vw_admin_subscriptions AS
SELECT 
    s.id as subscription_id,
    s.user_id,
    COALESCE(u.email, 'sem-email') as email,  -- garante que nunca seja NULL
    s.plan,
    s.start_date,
    s.end_date,
    CASE 
        WHEN s.end_date IS NULL THEN 'sem assinatura'
        WHEN NOW() > s.end_date THEN 'expirada'
        WHEN s.plan = 'free' THEN 'trial'
        WHEN s.plan = 'paid' THEN 'ativa'
        ELSE 'desconhecido'
    END as status_assinatura,
    CASE 
        WHEN s.end_date IS NULL THEN NULL
        ELSE (s.end_date::date - NOW()::date)
    END as dias_restantes,
    u.created_at as cadastro
FROM public.subscriptions s
LEFT JOIN auth.users u ON u.id = s.user_id  -- LEFT JOIN evita erro se não achar user
ORDER BY s.start_date DESC;