# 🎯 Criar Conta Demo - Método Simples

## **Opção 1: Criar Manualmente no Site**

### **Passo 1: Acessar Registro**
```
http://localhost:3001/auth/register
```

### **Passo 2: Preencher:**
```
Nome: Usuário Demo
Email: demo@virtualcardapio.com
Senha: demo123
```

### **Passo 3: Criar Conta**
Clique em "Registrar"

✅ **Pronto!** Conta criada.

---

## **Opção 2: Via Supabase (Se já tiver conta)**

### **Passo 1: Gerar Hash da Senha**

Acesse: https://bcrypt-generator.com/

```
String: demo123
Rounds: 10
```

Clique em "Generate Hash"

Copie o resultado (algo como: `$2a$10$...`)

### **Passo 2: Executar SQL**

No Supabase SQL Editor:

```sql
INSERT INTO "User" (id, name, email, password, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Usuário Demo',
  'demo@virtualcardapio.com',
  'COLE_O_HASH_AQUI',  -- Hash gerado no passo 1
  NOW(),
  NOW()
);
```

---

## **✅ Credenciais:**

```
📧 Email: demo@virtualcardapio.com
🔑 Senha: demo123
```

---

## **🎯 Recomendação:**

**Use a Opção 1** - É mais rápido!

1. Acesse: http://localhost:3001/auth/register
2. Preencha: demo@virtualcardapio.com / demo123
3. Clique em "Registrar"
4. Pronto!

Depois é só fazer login com essas credenciais.

---

## **📱 Testar:**

1. Acesse: http://localhost:3001/auth/login
2. Email: demo@virtualcardapio.com
3. Senha: demo123
4. Entrar

Ou clique no botão: **"🎯 ACESSAR DEMONSTRAÇÃO"**
