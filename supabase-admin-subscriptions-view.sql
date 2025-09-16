-- VIEW para administração de assinaturas
-- Esta VIEW consolida dados de assinaturas com informações do usuário
-- para facilitar o gerenciamento no painel administrativo

-- Remover VIEW existente se houver
DROP VIEW IF EXISTS public.vw_admin_subscriptions;

-- Criar VIEW vw_admin_subscriptions
CREATE VIEW public.vw_admin_subscriptions 
WITH (security_invoker = true) AS
SELECT 
    s.id as subscription_id,
    s.user_id,
    u.email,
    s.plan,
    s.start_date as data_inicio,
    s.end_date as data_vencimento,
    s.created_at as data_criacao,
    
    -- Status calculado da assinatura
    CASE 
        WHEN s.end_date IS NULL THEN 'sem_vencimento'
        WHEN s.end_date < NOW() THEN 'expirada'
        WHEN s.plan = 'free' AND s.end_date > NOW() THEN 'trial'
        WHEN s.plan = 'paid' AND s.end_date > NOW() THEN 'ativa'
        ELSE 'indefinida'
    END as status_assinatura,
    
    -- Dias restantes (negativo se expirada)
    CASE 
        WHEN s.end_date IS NULL THEN NULL
        ELSE EXTRACT(DAY FROM (s.end_date - NOW()))::INTEGER
    END as dias_restantes,
    
    -- Informações do perfil do usuário
    p.full_name as nome_usuario,
    p.role as role_usuario,
    
    -- Informações do restaurante (se existir)
    r.name as nome_restaurante,
    r.slug as slug_restaurante
    
FROM public.subscriptions s
LEFT JOIN auth.users u ON s.user_id = u.id
LEFT JOIN public.profiles p ON s.user_id = p.id
LEFT JOIN public.restaurants r ON s.user_id = r.user_id
ORDER BY s.created_at DESC;

-- Política RLS para a VIEW (apenas admins podem acessar)
CREATE POLICY "Admin can view all subscriptions" ON public.vw_admin_subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Comentário explicativo
COMMENT ON VIEW public.vw_admin_subscriptions IS 
'VIEW administrativa para gerenciar assinaturas. Inclui dados do usuário, status calculado, dias restantes e informações do restaurante. Acesso restrito a administradores.';