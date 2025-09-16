-- Permissões para as VIEWs administrativas
-- Este arquivo deve ser executado no Supabase SQL Editor

-- 1. Dar permissão SELECT na view vw_admin_users para usuários autenticados
GRANT SELECT ON vw_admin_users TO authenticated;

-- 2. Dar permissão SELECT na view vw_admin_subscriptions para usuários autenticados  
GRANT SELECT ON vw_admin_subscriptions TO authenticated;

-- 3. Criar política RLS para vw_admin_users (apenas admins podem acessar)
CREATE POLICY "Admin only access to vw_admin_users" ON vw_admin_users
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 4. Criar política RLS para vw_admin_subscriptions (apenas admins podem acessar)
CREATE POLICY "Admin only access to vw_admin_subscriptions" ON vw_admin_subscriptions
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 5. Habilitar RLS nas views (se ainda não estiver habilitado)
ALTER TABLE vw_admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vw_admin_subscriptions ENABLE ROW LEVEL SECURITY;

-- Comentários:
-- - GRANT SELECT TO authenticated: Permite que usuários autenticados façam SELECT
-- - As políticas RLS garantem que apenas admins (profiles.role = 'admin') possam acessar
-- - auth.uid() retorna o ID do usuário autenticado atual
-- - EXISTS verifica se existe um profile com role 'admin' para o usuário atual