-- Criar tabela restaurants no Supabase
create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  phone text,
  whatsapp text,
  address text,
  owner_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- Criar índice para buscas rápidas por usuário
create index if not exists idx_restaurants_owner on public.restaurants(owner_id);

-- Ativar RLS (Row Level Security)
alter table public.restaurants enable row level security;

-- Usuário só pode VER os restaurantes dele
create policy "Users can view own restaurants"
on public.restaurants for select
using ( auth.uid() = owner_id );

-- Usuário só pode INSERIR restaurantes em seu nome
create policy "Users can insert own restaurants"
on public.restaurants for insert
with check ( auth.uid() = owner_id );

-- Usuário só pode ATUALIZAR seus restaurantes
create policy "Users can update own restaurants"
on public.restaurants for update
using ( auth.uid() = owner_id );

-- Usuário só pode DELETAR seus restaurantes
create policy "Users can delete own restaurants"
on public.restaurants for delete
using ( auth.uid() = owner_id );