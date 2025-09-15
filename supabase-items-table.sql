-- Criar tabela de itens
create table public.items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null,
  promo_price numeric,
  is_promo boolean default false,
  image text,
  category_id uuid references public.categories(id) on delete cascade,
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  created_at timestamp default now()
);

-- Ativar Row Level Security
alter table public.items enable row level security;

-- Permitir que o dono do restaurante gerencie os itens
create policy "Users can manage their own items"
on public.items
for all
using (
  exists (
    select 1 from public.restaurants r
    where r.id = items.restaurant_id
    and r.owner_id = auth.uid()
  )
);

-- Permitir que administradores (profiles.role = 'admin') também gerenciem
create policy "Admins can manage all items"
on public.items
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role = 'admin'
  )
);