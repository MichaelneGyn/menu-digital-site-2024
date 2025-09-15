-- VIEW administrativa completa para usuários e assinaturas
-- Execute este script no Supabase SQL Editor

-- 1. Remover VIEW existente se houver
drop view if exists public.vw_admin_users;

-- 2. Criar VIEW administrativa completa
create or replace view public.vw_admin_users as
select 
  u.id as user_id,
  u.email,
  u.created_at as signup_date,
  u.email_confirmed_at,
  u.last_sign_in_at,
  coalesce(p.role, 'user') as role,
  s.plan,
  s.start_date,
  s.end_date,
  case 
    when s.plan is null then 'sem assinatura'
    when now() > s.end_date then 'expirada'
    when s.plan = 'free' then 'trial'
    when s.plan = 'paid' then 'ativa'
    else 'desconhecido'
  end as status_assinatura,
  -- Calcula dias restantes para assinaturas ativas
  case 
    when s.end_date is not null and now() <= s.end_date then 
      extract(days from (s.end_date - now()))::integer
    else 0
  end as dias_restantes,
  -- Informações do restaurante se existir
  r.name as restaurant_name,
  r.slug as restaurant_slug,
  r.active as restaurant_active
from auth.users u
left join public.profiles p on p.id = u.id
left join public.subscriptions s on s.user_id = u.id
left join public.restaurants r on r.user_id = u.id
order by u.created_at desc;

-- 2. Configurar segurança da VIEW
alter view vw_admin_users set (security_invoker = true);

-- 3. Criar política RLS para a VIEW (somente admin acessa)
create policy "Admins can view vw_admin_users"
on vw_admin_users
for select using (
  exists (
    select 1 from public.profiles pr
    where pr.id = auth.uid() and pr.role = 'admin'
  )
);

-- Comentário explicativo
comment on view vw_admin_users is 
'VIEW administrativa simplificada que sincroniza usuários com suas assinaturas para o painel admin';