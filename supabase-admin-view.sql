-- VIEW administrativa para consolidar usuários e assinaturas
-- Execute este script no Supabase SQL Editor

-- 1. Criar VIEW administrativa
create or replace view vw_admin_users_subscriptions as
select 
  u.id as user_id,
  u.email,
  u.created_at as user_created_at,
  p.role,
  s.id as subscription_id,
  s.plan,
  s.start_date,
  s.end_date,
  s.created_at as subscription_created_at,
  case 
    when s.id is null then 'sem_assinatura'
    when now() > s.end_date then 'expirada'
    when s.plan = 'free' then 'trial'
    when s.plan = 'paid' then 'paga'
    else 'desconhecido'
  end as status_assinatura,
  case 
    when s.id is null then 0
    when now() > s.end_date then 0
    else extract(days from (s.end_date - now()))::integer
  end as dias_restantes
from auth.users u
left join public.profiles p on p.id = u.id
left join public.subscriptions s on s.user_id = u.id
order by u.created_at desc;

-- 2. Configurar segurança da VIEW
alter view vw_admin_users_subscriptions set (security_invoker = true);

-- 3. Criar política RLS para a VIEW
create policy "Admins podem ver vw_admin_users_subscriptions"
on vw_admin_users_subscriptions
for select
using (
  exists (
    select 1 from public.profiles pr
    where pr.id = auth.uid() and pr.role = 'admin'
  )
);

-- Comentário explicativo
comment on view vw_admin_users_subscriptions is 
'VIEW administrativa que consolida informações de usuários e suas assinaturas para relatórios de CRM/Admin';