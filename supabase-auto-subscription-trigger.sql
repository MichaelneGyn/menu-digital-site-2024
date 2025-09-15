-- Trigger automático para criar assinatura trial para novos usuários
-- Execute este script no Supabase SQL Editor

-- 1. Criar função para lidar com novos usuários
create or replace function public.handle_new_user_subscription()
returns trigger as $$
begin
  -- Inserir assinatura trial de 3 dias para o novo usuário
  insert into public.subscriptions (user_id, plan, start_date, end_date)
  values (new.id, 'free', now(), now() + interval '3 days');
  
  return new;
end;
$$ language plpgsql security definer;

-- 2. Remover trigger existente se houver
drop trigger if exists on_auth_user_created on auth.users;

-- 3. Criar trigger para executar após inserção de novo usuário
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user_subscription();

-- Comentário explicativo
comment on function public.handle_new_user_subscription() is 
'Função que cria automaticamente uma assinatura trial de 3 dias para todo novo usuário registrado';

comment on trigger on_auth_user_created on auth.users is 
'Trigger que executa automaticamente quando um novo usuário é criado, garantindo que ele receba uma assinatura trial';