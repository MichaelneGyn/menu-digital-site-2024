-- Criar tabela de assinaturas
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  plan text not null default 'free',     -- free ou paid
  status text not null default 'active', -- active, expired, canceled
  start_date timestamp with time zone default now(),
  end_date timestamp with time zone not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índice para buscar assinaturas rápido
create index if not exists idx_subscriptions_user
on public.subscriptions(user_id);

create index if not exists idx_subscriptions_status
on public.subscriptions(status);

create index if not exists idx_subscriptions_end_date
on public.subscriptions(end_date);

-- Ativar Row Level Security
alter table public.subscriptions enable row level security;

-- Policies: cada user só vê sua própria assinatura
create policy "Users can view own subscriptions"
on public.subscriptions for select
using ( auth.uid() = user_id );

create policy "Users can manage own subscriptions"
on public.subscriptions for all
using ( auth.uid() = user_id )
with check ( auth.uid() = user_id );

-- Função para atualizar updated_at automaticamente
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger para atualizar updated_at
create trigger update_subscriptions_updated_at
  before update on public.subscriptions
  for each row
  execute function update_updated_at_column();

-- Tabela para controle anti-burla (baseado em dados únicos do dispositivo/localização)
create table if not exists public.device_fingerprints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  fingerprint_hash text not null,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone default now()
);

-- Índices para device_fingerprints
create index if not exists idx_device_fingerprints_hash
on public.device_fingerprints(fingerprint_hash);

create index if not exists idx_device_fingerprints_user
on public.device_fingerprints(user_id);

-- RLS para device_fingerprints
alter table public.device_fingerprints enable row level security;

create policy "Users can view own fingerprints"
on public.device_fingerprints for select
using ( auth.uid() = user_id );

create policy "Users can manage own fingerprints"
on public.device_fingerprints for all
using ( auth.uid() = user_id )
with check ( auth.uid() = user_id );

-- Função para verificar se um fingerprint já foi usado
create or replace function check_fingerprint_usage(fingerprint text)
returns boolean as $$
declare
  usage_count integer;
begin
  select count(*) into usage_count
  from public.device_fingerprints df
  join public.subscriptions s on df.user_id = s.user_id
  where df.fingerprint_hash = fingerprint
  and s.plan = 'free'
  and s.created_at > now() - interval '30 days';
  
  return usage_count > 0;
end;
$$ language plpgsql security definer;