# ⚡ Setup Rápido Vercel - RESOLUÇÃO DO ERRO 401

## 🔴 PROBLEMA ENCONTRADO:
Seu `schema.prisma` estava configurado para **SQLite** mas você está usando **PostgreSQL**!

## ✅ JÁ CORRIGI:
```prisma
datasource db {
  provider  = "postgresql"  ← Mudei de "sqlite" para "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## 🚀 PASSOS PARA FAZER FUNCIONAR:

### 1️⃣ Configurar Variáveis no Vercel

Acesse: https://vercel.com/michaelnegyn/menu-digital-site-2024/settings/environment-variables

**Adicione estas variáveis (TODAS as 3 ambientes: Production, Preview, Development):**

```env
DATABASE_URL
Valor: postgresql://[usuario]:[senha]@[host].neon.tech/[database]?sslmode=require

DIRECT_URL
Valor: (mesmo valor da DATABASE_URL, ou a URL direta do Neon)

NEXTAUTH_SECRET
Valor: cole_um_secret_aleatorio_aqui_32_caracteres

NEXTAUTH_URL
Valor: https://menu-digital-site-2024-8773d37d60644f6.vercel.app

NEXT_PUBLIC_ADMIN_EMAIL
Valor: michaeldouglasqueiroz@gmail.com
```

---

### 2️⃣ Como Pegar a DATABASE_URL do Neon

```
1. Vá em: https://console.neon.tech
2. Selecione seu projeto
3. Dashboard > Connection Details
4. Copie a string de conexão
5. Formato: postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

---

### 3️⃣ Gerar NEXTAUTH_SECRET

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Ou use online:**
https://generate-secret.vercel.app/32

---

### 4️⃣ Configurar Build Command no Vercel

```
1. Vercel Dashboard > Settings > General
2. Em "Build & Development Settings"
3. Build Command: npm run build
4. Output Directory: .next
5. Install Command: npm install
```

---

### 5️⃣ Adicionar Script de Build com Prisma

Verifique se seu `package.json` tem:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "postinstall": "prisma generate"
  }
}
```

---

### 6️⃣ Fazer Deploy

```bash
# No seu terminal local:
git add .
git commit -m "fix: mudar schema.prisma de sqlite para postgresql"
git push origin master
```

O Vercel vai fazer deploy automaticamente!

---

## 🔍 VERIFICAR SE FUNCIONOU:

1. Vá em: https://vercel.com/michaelnegyn/menu-digital-site-2024
2. Clique em "Deployments"
3. Aguarde o build terminar (uns 2-3 minutos)
4. Clique em "Visit"
5. Tente fazer login
6. ✅ Se funcionar, você verá o dashboard!

---

## ⚠️ SE AINDA DER ERRO:

### Erro: "Prisma Client não gerado"
```bash
# Adicione no package.json:
"postinstall": "prisma generate"
```

### Erro: "Tabelas não existem"
```bash
# Você precisa rodar as migrations no Neon:
npx prisma migrate deploy
```

### Erro: "401 Unauthorized ainda"
```
Verifique se:
1. DATABASE_URL está correta no Vercel
2. NEXTAUTH_SECRET está configurado
3. NEXTAUTH_URL está com a URL correta do Vercel
4. Seu email está cadastrado no banco (tabela User)
```

---

## 📊 VARIÁVEIS ESSENCIAIS (CHECKLIST):

- [ ] DATABASE_URL (PostgreSQL do Neon)
- [ ] DIRECT_URL (mesma URL ou específica)
- [ ] NEXTAUTH_SECRET (32+ caracteres aleatórios)
- [ ] NEXTAUTH_URL (URL do Vercel)
- [ ] NEXT_PUBLIC_ADMIN_EMAIL (seu email)

---

## 🎯 RESUMO DO QUE FOI CORRIGIDO:

1. ✅ Schema.prisma: SQLite → PostgreSQL
2. ✅ Adicionado directUrl para suporte a Prisma Accelerate
3. 📝 Guia completo de variáveis de ambiente
4. 📝 Instruções de deploy

---

## 🆘 PRECISA DE AJUDA?

Me envie:
1. Screenshot dos logs do deploy (se der erro)
2. Confirme se adicionou TODAS as variáveis de ambiente
3. URL do deploy
