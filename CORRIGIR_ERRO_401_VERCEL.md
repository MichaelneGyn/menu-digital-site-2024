# 🔴 **CORRIGIR ERRO 401 NO LOGIN (VERCEL)**

---

## 🎯 **PROBLEMA:**

```
❌ Erro 401 (Unauthorized) ao fazer login
❌ Sistema funciona local mas não na Vercel
❌ Failed to load resource: status 401
```

---

## ✅ **SOLUÇÃO PASSO A PASSO:**

### **1. Verificar Variáveis de Ambiente na Vercel** 🔴 **URGENTE**

**Acesse:**
```
1. https://vercel.com
2. Seu projeto
3. Settings → Environment Variables
```

**Verifique se TEM essas variáveis:**

```env
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
OPENCAGE_API_KEY (opcional)
```

---

### **2. NEXTAUTH_SECRET** ⚠️ **CRÍTICO**

**Problema:** Se não existir ou estiver errado, login NÃO funciona!

**Solução:**

1. **Gere um novo secret:**
```bash
# No seu terminal local:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Isso vai gerar algo como:
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

2. **Adicione na Vercel:**
```
Nome: NEXTAUTH_SECRET
Valor: [cole o valor gerado acima]
Environment: Production, Preview, Development (todos)
```

---

### **3. NEXTAUTH_URL** 🌐

**Deve ser a URL da sua aplicação na Vercel:**

```env
NEXTAUTH_URL=https://seu-projeto.vercel.app
```

**⚠️ SEM barra no final!**

❌ Errado: `https://seu-projeto.vercel.app/`  
✅ Certo: `https://seu-projeto.vercel.app`

**Na Vercel:**
```
Nome: NEXTAUTH_URL
Valor: https://menu-digital-site-2024-8771a17d604.vercel.app
Environment: Production
```

---

### **4. DATABASE_URL** 💾

**Deve ser a string de conexão do seu banco PostgreSQL:**

```env
DATABASE_URL=postgresql://usuario:senha@host/database?sslmode=require
```

**⚠️ IMPORTANTE:**
- Se estiver usando Neon, Supabase ou Railway, copie a string EXATA
- Deve terminar com `?sslmode=require` ou `?sslaccept=strict`

**Na Vercel:**
```
Nome: DATABASE_URL
Valor: [sua connection string completa]
Environment: Production, Preview, Development
```

---

## 🚀 **CHECKLIST COMPLETO:**

### **Na Vercel (Settings → Environment Variables):**

```
✅ DATABASE_URL
   └─ postgresql://...

✅ NEXTAUTH_SECRET
   └─ [string aleatória de 64 caracteres]

✅ NEXTAUTH_URL
   └─ https://seu-projeto.vercel.app (SEM barra no final)

✅ OPENCAGE_API_KEY (se usar validação de CEP)
   └─ sua-chave-opencage
```

---

## 📝 **DEPOIS DE CONFIGURAR:**

### **1. Redeploy:**
```
1. Vercel Dashboard
2. Deployments
3. Clique nos 3 pontos do último deploy
4. "Redeploy"
5. Aguarde o deploy terminar
```

### **2. Limpe o Cache:**
```
Ctrl + Shift + R (no navegador)
ou
Cmd + Shift + R (Mac)
```

### **3. Teste o Login:**
```
1. Acesse sua URL da Vercel
2. Vá para /auth/login
3. Tente fazer login
4. Deve funcionar agora! ✅
```

---

## 🔍 **VERIFICAR SE ESTÁ CORRETO:**

### **Teste rápido:**

1. **Abra o Console do navegador** (F12)
2. **Vá para Network**
3. **Tente fazer login**
4. **Procure a requisição `/api/auth/callback/credentials`**
5. **Veja o status:**
   - ✅ 200 OK = Funcionou!
   - ❌ 401 Unauthorized = Ainda tem problema

---

## ⚠️ **ERROS COMUNS:**

### **1. NEXTAUTH_URL com barra no final:**
```
❌ https://seu-projeto.vercel.app/
✅ https://seu-projeto.vercel.app
```

### **2. NEXTAUTH_SECRET muito curto:**
```
❌ abc123
✅ a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### **3. DATABASE_URL sem SSL:**
```
❌ postgresql://user:pass@host/db
✅ postgresql://user:pass@host/db?sslmode=require
```

---

## 🆘 **SE AINDA NÃO FUNCIONAR:**

### **Verifique os logs da Vercel:**

```
1. Vercel Dashboard
2. Seu projeto
3. Deployments
4. Clique no deployment atual
5. Runtime Logs
6. Procure por erros relacionados a:
   - "NEXTAUTH_SECRET"
   - "Database"
   - "Prisma"
```

### **Logs importantes:**

```
❌ "NEXTAUTH_SECRET is not set"
   → Adicione a variável

❌ "Can't connect to database"
   → Verifique DATABASE_URL

❌ "Invalid credentials"
   → Senha do usuário incorreta (teste com outro usuário)
```

---

## 💡 **DICA EXTRA:**

### **Criar usuário de teste direto no banco:**

Se você tiver acesso ao banco de dados (Neon, Supabase, etc):

```sql
-- Conecte no banco e execute:
SELECT email, password FROM "User" WHERE email = 'seu@email.com';
```

Isso mostra se o usuário existe e qual o hash da senha.

---

## 🎯 **RESUMO RÁPIDO:**

```
1. Gere NEXTAUTH_SECRET:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

2. Adicione na Vercel:
   NEXTAUTH_SECRET = [valor gerado]
   NEXTAUTH_URL = https://seu-projeto.vercel.app
   DATABASE_URL = [sua connection string]

3. Redeploy

4. Limpe cache (Ctrl + Shift + R)

5. Teste login

6. ✅ Deve funcionar!
```

---

## 📞 **AINDA COM PROBLEMA?**

Me envie:
1. Screenshot dos Environment Variables da Vercel (pode borrar valores sensíveis)
2. Screenshot do erro no Console (F12 → Network)
3. URL do seu projeto na Vercel

---

**🔧 SIGA ESSES PASSOS E DEVE RESOLVER!**
