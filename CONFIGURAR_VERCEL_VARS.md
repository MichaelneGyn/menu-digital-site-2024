# 🔧 CONFIGURAR VARIÁVEIS DE AMBIENTE NO VERCEL

## 📍 PASSO A PASSO:

### 1. Acessar Vercel
```
https://vercel.com/dashboard
```

### 2. Selecionar seu projeto
- Clique no card do projeto "menu-digital-site-2024"

### 3. Ir em Settings
- Aba superior: **Settings**

### 4. Environment Variables
- Menu lateral: **Environment Variables**

### 5. Verificar DATABASE_URL
**SE ESTIVER ASSIM (ERRADO):**
```
DATABASE_URL = file:./dev.db
```

**DELETE ESSA VARIÁVEL!**

### 6. Adicionar variáveis corretas

Clique em **Add New** e adicione uma por uma:

---

#### DATABASE_URL
```
Key: DATABASE_URL
Value: postgresql://postgres:Mdqs%40%402590%21@db.vppvfgmkfrycktsulahd.supabase.co:5432/postgres
Environments: Production, Preview, Development (marcar todos)
```

---

#### DIRECT_URL
```
Key: DIRECT_URL
Value: postgresql://postgres:Mdqs%40%402590%21@db.vppvfgmkfrycktsulahd.supabase.co:5432/postgres
Environments: Production, Preview, Development
```

---

#### NEXTAUTH_SECRET
```
Key: NEXTAUTH_SECRET
Value: f0yJSIQbwq7+NRCSHUNFb/52ZPF04KZBgxK0idkvx4I=
Environments: Production, Preview, Development
```

---

#### NEXTAUTH_URL
```
Key: NEXTAUTH_URL
Value: https://menu-digital-site-2024-8773d37d606448f665f364adadb0d-e1lh5rlaj.vercel.app
Environments: Production apenas
```

---

#### NEXT_PUBLIC_SUPABASE_URL
```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://vppvfgmkfrycktsulahd.supabase.co
Environments: Production, Preview, Development
```

---

#### NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwcHZmZ21rZnJ5Y2t0c3VsYWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MjM3NzUsImV4cCI6MjA3NDQ5OTc3NX0.g5rAdICbw__d4YSjNfCGpcJDWxsmqWDsDt7JfvsUUJA
Environments: Production, Preview, Development
```

---

#### SUPABASE_JWT_SECRET
```
Key: SUPABASE_JWT_SECRET
Value: fSsiDwZ8Jfta8JIbOlzZvFgOVdgmenJE/nl7fjnNB+Bdeomm1hJ4vB3EaR3dM4JIDHQ6DP8Ygsz3OsxdEGNllg==
Environments: Production, Preview, Development
```

---

#### SUPABASE_PROJECT_REF
```
Key: SUPABASE_PROJECT_REF
Value: vppvfgmkfrycktsulahd
Environments: Production, Preview, Development
```

---

#### SUPABASE_SERVICE_ROLE_KEY
```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwcHZmZ21rZnJ5Y2t0c3VsYWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODkyMzc3NSwiZXhwIjoyMDc0NDk5Nzc1fQ.Ow2-A4kfhql48CfqZSCKVzrPPk2oCVhb_1CaBI77At8
Environments: Production, Preview, Development
```

---

### 7. Salvar todas

Clique em **Save** após adicionar cada variável.

---

### 8. Redeploy

1. Vá em **Deployments** (aba superior)
2. Clique no deploy mais recente
3. Clique nos **3 pontinhos** (...)
4. Clique em **Redeploy**
5. Aguarde 2-3 minutos

---

### 9. Testar

Acesse:
```
https://menu-digital-site-2024-8773d37d606448f665f364adadb0d-e1lh5rlaj.vercel.app/auth/login
```

Faça login:
```
Email: michaeldouglasqueiroz@gmail.com
Senha: [sua senha]
```

✅ **Deve funcionar!**

---

## 🎯 RESUMO

```
PROBLEMA: DATABASE_URL no Vercel estava como SQLite
SOLUÇÃO: Trocar para PostgreSQL (Supabase)
AÇÃO: Configurar variáveis conforme acima e redeploy

IMPORTANTE:
- DATABASE_URL DEVE ser PostgreSQL (não SQLite!)
- Marcar todos os environments (Production, Preview, Development)
- Redeploy após salvar as variáveis
```
