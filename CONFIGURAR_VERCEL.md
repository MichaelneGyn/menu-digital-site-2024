# 🚀 Configurar Variáveis de Ambiente no Vercel

## ❌ ERRO ATUAL:
```
"Accelerate was not able to parse the database URL"
PrismaClientKnownRequestError: Invalid invocation
401 Unauthorized
```

## ✅ SOLUÇÃO:

### 1️⃣ Acessar Configurações do Vercel

```
1. Vá em: https://vercel.com/michaelnegyn/menu-digital-site-2024
2. Clique em "Settings"
3. Clique em "Environment Variables"
```

---

### 2️⃣ Adicionar TODAS as Variáveis do .env

**⚠️ IMPORTANTE: Copie EXATAMENTE do seu arquivo .env local!**

```env
# Database (Neon + Prisma Accelerate)
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=SEU_API_KEY_AQUI"
DIRECT_URL="postgresql://usuario:senha@host/database?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="cole_o_valor_do_seu_env_local"
NEXTAUTH_URL="https://menu-digital-site-2024-8773d37d60644f6.vercel.app"

# AWS S3
AWS_ACCESS_KEY_ID="seu_access_key"
AWS_SECRET_ACCESS_KEY="seu_secret_key"
AWS_REGION="us-east-1"
AWS_BUCKET_NAME="seu_bucket"

# Admin Email
NEXT_PUBLIC_ADMIN_EMAIL="michaeldouglasqueiroz@gmail.com"

# Outras variáveis necessárias
NODE_ENV="production"
```

---

### 3️⃣ ATENÇÃO: DATABASE_URL com Prisma Accelerate

**Se você está usando Prisma Accelerate:**

```env
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
DIRECT_URL="postgresql://usuario:senha@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

**Se NÃO está usando Accelerate (recomendado para começar):**

```env
DATABASE_URL="postgresql://usuario:senha@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

---

### 4️⃣ Como Descobrir sua DATABASE_URL do Neon

```
1. Vá em: https://console.neon.tech
2. Selecione seu projeto
3. Clique em "Connection Details"
4. Copie a "Connection string"
5. Formato: postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

---

### 5️⃣ Gerar NEXTAUTH_SECRET

**No terminal local:**
```bash
openssl rand -base64 32
```

**Ou use este online:**
https://generate-secret.vercel.app/32

---

### 6️⃣ Configurar NEXTAUTH_URL

```env
# Produção (Vercel)
NEXTAUTH_URL="https://menu-digital-site-2024-8773d37d60644f6.vercel.app"

# Ou use seu domínio customizado
NEXTAUTH_URL="https://seudominio.com"
```

---

### 7️⃣ Após Adicionar as Variáveis

```
1. Clique em "Save"
2. Vá em "Deployments"
3. Clique nos três pontos do último deploy
4. Clique em "Redeploy"
5. Marque "Use existing Build Cache"
6. Clique em "Redeploy"
```

---

## 🔍 VERIFICAR SE DEU CERTO:

1. Aguarde o deploy terminar
2. Clique em "View Deployment"
3. Tente fazer login
4. Verifique os logs (não deve ter mais erros)

---

## ⚠️ CHECKLIST DE VARIÁVEIS ESSENCIAIS:

- [ ] DATABASE_URL (PostgreSQL do Neon)
- [ ] NEXTAUTH_SECRET (gerado com openssl)
- [ ] NEXTAUTH_URL (URL do Vercel)
- [ ] AWS_ACCESS_KEY_ID (se usar S3)
- [ ] AWS_SECRET_ACCESS_KEY (se usar S3)
- [ ] NEXT_PUBLIC_ADMIN_EMAIL (seu email)

---

## 🚨 SE AINDA DER ERRO:

### Opção 1: Desabilitar Prisma Accelerate

1. Remova `prisma://` da DATABASE_URL
2. Use apenas a URL direta do PostgreSQL
3. Comente esta linha no schema.prisma:
```prisma
generator client {
  provider = "prisma-client-js"
  // previewFeatures = ["driverAdapters"]  ← Comente se der erro
}
```

### Opção 2: Verificar Logs Detalhados

```
1. Vercel Dashboard > Logs
2. Procure por "DATABASE_URL"
3. Veja se está mascarado (correto) ou vazio (errado)
```

---

## 📝 EXEMPLO DE CONFIGURAÇÃO MÍNIMA:

```env
DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"
NEXTAUTH_SECRET="seu_secret_aqui_32_caracteres"
NEXTAUTH_URL="https://seu-deploy.vercel.app"
NEXT_PUBLIC_ADMIN_EMAIL="seu@email.com"
```

---

## ✅ DEPOIS DE CONFIGURAR:

1. Faça login no site
2. Se funcionar, você verá o dashboard
3. Se ainda der 401, verifique se o email está cadastrado no banco

---

## 🆘 AINDA COM PROBLEMA?

Me envie:
1. Screenshot dos logs do Vercel
2. Confirme se DATABASE_URL está configurado (não precisa enviar o valor)
3. URL do deploy que está dando erro
