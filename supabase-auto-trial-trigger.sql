-- Função para criar automaticamente uma assinatura trial para novos usuários
create or replace function public.handle_new_user_subscription()
returns trigger as $$
begin
  -- Criar assinatura trial de 3 dias para o novo usuário
  insert into public.subscriptions (user_id, plan, start_date, end_date)
  values (new.id, 'free', now(), now() + interval '3 days');
  
  return new;
end;
$$ language plpgsql security definer;

-- Remover trigger existente se houver
drop trigger if exists on_auth_user_created on auth.users;

-- Criar trigger que executa quando um novo usuário é criado
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user_subscription();

-- Comentário explicativo
comment on function public.handle_new_user_subscription() is 
'Função que cria automaticamente uma assinatura trial de 3 dias quando um novo usuário se registra no sistema';