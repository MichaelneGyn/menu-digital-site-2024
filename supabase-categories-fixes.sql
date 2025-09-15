-- Correções para isolamento de categorias por restaurante
-- Problema 1: Categorias aparecem para todos os clientes

-- 1. Adicionar coluna restaurant_id na tabela categories
alter table public.categories 
add column if not exists restaurant_id uuid references public.restaurants(id) on delete cascade;

-- 2. Adicionar coluna slug na tabela restaurants para URLs dinâmicas
alter table public.restaurants 
add column if not exists slug text unique;

-- 3. Habilitar RLS na tabela categories
alter table public.categories enable row level security;

-- 4. Política para visualização: usuário só vê categorias do próprio restaurante
create policy "User sees only own restaurant categories" 
on public.categories 
for select using ( 
  exists ( 
    select 1 from public.restaurants r 
    where r.id = categories.restaurant_id 
    and r.owner_id = auth.uid() 
  ) 
);

-- 5. Política para inserção: usuário só pode criar categorias para próprio restaurante
create policy "User inserts category only for own restaurant" 
on public.categories 
for insert with check ( 
  exists ( 
    select 1 from public.restaurants r 
    where r.id = restaurant_id 
    and r.owner_id = auth.uid() 
  ) 
);

-- 6. Política para atualização: usuário só pode atualizar categorias do próprio restaurante
create policy "User updates only own restaurant categories" 
on public.categories 
for update using ( 
  exists ( 
    select 1 from public.restaurants r 
    where r.id = categories.restaurant_id 
    and r.owner_id = auth.uid() 
  ) 
);

-- 7. Política para exclusão: usuário só pode deletar categorias do próprio restaurante
create policy "User deletes only own restaurant categories" 
on public.categories 
for delete using ( 
  exists ( 
    select 1 from public.restaurants r 
    where r.id = categories.restaurant_id 
    and r.owner_id = auth.uid() 
  ) 
);

-- 8. Habilitar RLS na tabela items também (para garantir isolamento completo)
alter table public.items enable row level security;

-- 9. Política para items: usuário só vê itens de categorias do próprio restaurante
create policy "User sees only own restaurant items" 
on public.items 
for select using ( 
  exists ( 
    select 1 from public.categories c 
    join public.restaurants r on r.id = c.restaurant_id 
    where c.id = items.category_id 
    and r.owner_id = auth.uid() 
  ) 
);

-- 10. Política para inserção de items
create policy "User inserts items only for own restaurant categories" 
on public.items 
for insert with check ( 
  exists ( 
    select 1 from public.categories c 
    join public.restaurants r on r.id = c.restaurant_id 
    where c.id = category_id 
    and r.owner_id = auth.uid() 
  ) 
);

-- 11. Política para atualização de items
create policy "User updates only own restaurant items" 
on public.items 
for update using ( 
  exists ( 
    select 1 from public.categories c 
    join public.restaurants r on r.id = c.restaurant_id 
    where c.id = items.category_id 
    and r.owner_id = auth.uid() 
  ) 
);

-- 12. Política para exclusão de items
create policy "User deletes only own restaurant items" 
on public.items 
for delete using ( 
  exists ( 
    select 1 from public.categories c 
    join public.restaurants r on r.id = c.restaurant_id 
    where c.id = items.category_id 
    and r.owner_id = auth.uid() 
  ) 
);