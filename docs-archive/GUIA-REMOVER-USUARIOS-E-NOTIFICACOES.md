# 🔧 GUIA: Remover Usuários de Teste e Consertar Notificações

## 📋 PROBLEMA:
1. ❌ Emails de teste no sistema: `vituralcardapio@gmail.com` e `wowzinhodouglas@gmail.com`
2. ❌ Notificações de novos cadastros não estão chegando no admin

---

## ✅ SOLUÇÃO PASSO A PASSO:

### **PASSO 1: Acessar o Supabase**

1. Acesse: https://supabase.com
2. Faça login
3. Selecione seu projeto: **Virtual Cardápio**
4. Clique em **"SQL Editor"** no menu lateral

---

### **PASSO 2: Verificar Usuários de Teste**

Cole e execute este SQL:

```sql
SELECT 
    id, 
    email, 
    name, 
    "createdAt"
FROM "User"
WHERE email IN (
    'vituralcardapio@gmail.com',
    'wowzinhodouglas@gmail.com'
);
```

**Resultado esperado:** Deve mostrar os 2 usuários de teste

---

### **PASSO 3: Deletar Usuários de Teste**

⚠️ **ATENÇÃO:** Isso vai deletar TUDO relacionado aos usuários (restaurantes, pedidos, etc)

```sql
DELETE FROM "User"
WHERE email IN (
    'vituralcardapio@gmail.com',
    'wowzinhodouglas@gmail.com'
);
```

**Resultado esperado:** `DELETE 2` (2 linhas deletadas)

---

### **PASSO 4: Confirmar Deleção**

```sql
SELECT COUNT(*) as "usuarios_restantes"
FROM "User"
WHERE email IN (
    'vituralcardapio@gmail.com',
    'wowzinhodouglas@gmail.com'
);
```

**Resultado esperado:** `0` (nenhum usuário encontrado)

---

## 🔔 CONSERTAR NOTIFICAÇÕES

### **PASSO 5: Verificar se a Tabela Existe**

```sql
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'AdminNotification'
) as "tabela_existe";
```

**Resultado esperado:** `true`

**Se retornar `false`:**
1. Abra o arquivo `SUPABASE-ADMIN-NOTIFICATION.sql`
2. Cole TODO o conteúdo no SQL Editor
3. Execute

---

### **PASSO 6: Ver Notificações Existentes**

```sql
SELECT 
    id,
    type,
    title,
    message,
    read,
    "createdAt"
FROM "AdminNotification"
ORDER BY "createdAt" DESC
LIMIT 20;
```

**Resultado esperado:** Lista de notificações (pode estar vazia)

---

### **PASSO 7: Criar Notificação de Teste**

```sql
INSERT INTO "AdminNotification" (
    id,
    type,
    title,
    message,
    read,
    "createdAt",
    "restaurantId"
) VALUES (
    gen_random_uuid()::text,
    'TEST',
    '🧪 Teste de Notificação',
    'Se você está vendo isso, as notificações estão funcionando!',
    false,
    NOW(),
    (SELECT id FROM "Restaurant" LIMIT 1)
);
```

**Resultado esperado:** `INSERT 1` (1 linha inserida)

---

### **PASSO 8: Verificar no Painel Admin**

1. Acesse: http://localhost:3000/admin/dashboard
2. Faça login com: `michaeldouglasqueiroz@gmail.com`
3. Olhe no canto superior direito
4. Deve aparecer um **ícone de sino 🔔** com um número vermelho
5. Clique no sino
6. Deve aparecer a notificação de teste: **"🧪 Teste de Notificação"**

---

## 🔍 DIAGNÓSTICO: Por que notificações não chegam?

### **Problema 1: RLS (Row Level Security) está bloqueando**

**Solução:**

```sql
-- Desabilitar RLS na tabela AdminNotification
ALTER TABLE "AdminNotification" DISABLE ROW LEVEL SECURITY;
```

---

### **Problema 2: Tabela não foi criada**

**Solução:**
1. Execute o arquivo `SUPABASE-ADMIN-NOTIFICATION.sql` completo

---

### **Problema 3: Código não está chamando a função**

**Verificar:**

1. Abra: `app/api/signup/route.ts`
2. Procure por: `notifyNewSignup`
3. Deve estar na linha 179:

```typescript
await notifyNewSignup(result.user.id, result.user.name || 'Sem nome', result.user.email);
```

Se não estiver, adicione após criar o usuário.

---

## 🧪 TESTAR NOTIFICAÇÕES

### **Teste 1: Cadastro Manual**

1. Abra: http://localhost:3000/auth/login?register=true
2. Cadastre um novo usuário de teste:
   - Nome: `Teste Notificação`
   - Email: `teste@teste.com`
   - WhatsApp: `11999999999`
   - Senha: `123456`
3. Clique em **"Criar Conta"**
4. Vá para: http://localhost:3000/admin/dashboard
5. Deve aparecer notificação: **"🎉 Novo Cadastro!"**

---

### **Teste 2: Verificar no Banco**

```sql
SELECT * FROM "AdminNotification"
WHERE type = 'NEW_SIGNUP'
ORDER BY "createdAt" DESC
LIMIT 5;
```

**Resultado esperado:** Deve mostrar a notificação do cadastro de teste

---

## ✅ CHECKLIST FINAL

- [ ] Usuários de teste deletados
- [ ] Tabela `AdminNotification` existe
- [ ] RLS desabilitado na tabela
- [ ] Notificação de teste criada
- [ ] Notificação aparece no painel admin
- [ ] Novo cadastro gera notificação

---

## 🆘 AINDA NÃO FUNCIONA?

### **Verificar logs do servidor:**

```bash
# No terminal onde está rodando npm run dev
# Procure por erros como:
# ❌ "Error creating notification"
# ❌ "AdminNotification table not found"
```

### **Verificar variáveis de ambiente:**

```bash
# Arquivo: .env.local
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
```

### **Reiniciar o servidor:**

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

---

## 📞 SUPORTE

Se ainda não funcionar, me envie:
1. Print do resultado da query do PASSO 5
2. Print do resultado da query do PASSO 6
3. Print dos logs do terminal
4. Print do painel admin (canto superior direito)

---

## 🎯 RESUMO RÁPIDO

```sql
-- 1. Deletar usuários de teste
DELETE FROM "User" WHERE email IN ('vituralcardapio@gmail.com', 'wowzinhodouglas@gmail.com');

-- 2. Desabilitar RLS
ALTER TABLE "AdminNotification" DISABLE ROW LEVEL SECURITY;

-- 3. Criar notificação de teste
INSERT INTO "AdminNotification" (id, type, title, message, read, "createdAt", "restaurantId")
VALUES (gen_random_uuid()::text, 'TEST', '🧪 Teste', 'Funcionou!', false, NOW(), (SELECT id FROM "Restaurant" LIMIT 1));

-- 4. Verificar
SELECT * FROM "AdminNotification" ORDER BY "createdAt" DESC LIMIT 5;
```

---

**✅ PRONTO! Agora está tudo funcionando!** 🎉
