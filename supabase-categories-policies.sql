-- Políticas RLS para tabela categories com suporte a admin

-- Primeiro, garantir que a tabela categories existe e tem RLS habilitado
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text,
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Ativar Row Level Security
alter table public.categories enable row level security;

-- Remover políticas existentes se houver
drop policy if exists "Users can manage categories of own restaurants" on public.categories;
drop policy if exists "Admins can manage all categories" on public.categories;
drop policy if exists "Public can view categories" on public.categories;
drop policy if exists "Admins and owners can manage categories" on public.categories;
drop policy if exists "Users and Admin can manage categories" on public.categories;

-- Política para visualização pública de categorias
create policy "Public can view categories"
on public.categories for select
to public
using (true);

-- Política atualizada: Permite admin (por email) usar qualquer restaurant_id + donos gerenciarem seus restaurantes
create policy "Users and Admin can manage categories"
on public.categories
for all
using (
  -- Admin tem acesso total (baseado no email)
  auth.jwt() ->> 'email' in (
    'michaeldouglasqueiroz@gmail.com',
    'admin@onpedido.com'
  )
  or
  -- Ou é dono do restaurante
  exists (
    select 1 from public.restaurants r
    where r.id = categories.restaurant_id
    and r.owner_id = auth.uid()
  )
)
with check (
  -- Admin pode inserir/atualizar qualquer categoria
  auth.jwt() ->> 'email' in (
    'michaeldouglasqueiroz@gmail.com',
    'admin@onpedido.com'
  )
  or
  -- Ou é dono do restaurante
  exists (
    select 1 from public.restaurants r
    where r.id = categories.restaurant_id
    and r.owner_id = auth.uid()
  )
);

-- Criar índices para performance
create index if not exists idx_categories_restaurant_id on public.categories(restaurant_id);
create index if not exists idx_categories_name on public.categories(name);

-- Função para atualizar updated_at automaticamente
create or replace function update_categories_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger para atualizar updated_at
drop trigger if exists update_categories_updated_at_trigger on public.categories;
create trigger update_categories_updated_at_trigger
  before update on public.categories
  for each row
  execute function update_categories_updated_at();

-- Comentários para documentação
comment on table public.categories is 'Categorias de menu dos restaurantes com suporte a admin';
comment on policy "Admins and owners can manage categories" on public.categories is 'Permite que admins gerenciem todas as categorias e donos gerenciem categorias de seus restaurantes';
comment on policy "Public can view categories" on public.categories is 'Permite visualização pública das categorias';