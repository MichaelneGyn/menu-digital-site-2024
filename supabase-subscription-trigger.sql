-- Trigger para criar assinatura automática quando um usuário se cadastra
-- Garante que todo usuário tenha uma assinatura Free de 3 dias ao se registrar

-- Função que será executada quando um novo usuário for criado
create or replace function public.handle_new_user_subscription()
returns trigger as $$
begin
  -- Insere uma assinatura Free de 3 dias para o novo usuário
  insert into public.subscriptions (user_id, plan, start_date, end_date)
  values (new.id, 'free', now(), now() + interval '3 days');
  return new;
end;
$$ language plpgsql security definer;

-- Remove o trigger se já existir (para evitar duplicatas)
drop trigger if exists on_auth_user_created on auth.users;

-- Cria o trigger que executa após inserção de novo usuário
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user_subscription();

-- Comentário explicativo
comment on function public.handle_new_user_subscription() is 
'Função que cria automaticamente uma assinatura Free de 3 dias para novos usuários';

comment on trigger on_auth_user_created on auth.users is 
'Trigger que executa handle_new_user_subscription() quando um novo usuário é criado';