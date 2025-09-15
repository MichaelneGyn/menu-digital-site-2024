-- Criar tabela de assinaturas para controle de trial e planos pagos
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  plan text not null default 'free', -- free | paid
  start_date timestamp default now(),
  end_date timestamp,
  created_at timestamp default now()
);

-- Ativar Row Level Security
alter table public.subscriptions enable row level security;

-- Política: cada usuário só vê sua própria assinatura
create policy "Users can view own subscriptions"
on public.subscriptions
for select using ( auth.uid() = user_id );

-- Política: usuários podem inserir suas próprias assinaturas
create policy "Users can insert own subscriptions"
on public.subscriptions
for insert with check ( auth.uid() = user_id );

-- Política: usuários podem atualizar suas próprias assinaturas
create policy "Users can update own subscriptions"
on public.subscriptions
for update using ( auth.uid() = user_id );

-- Política: administradores podem gerenciar todas as assinaturas
create policy "Admins can manage all subscriptions"
on public.subscriptions
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role = 'admin'
  )
);