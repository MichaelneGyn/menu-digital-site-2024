# 🔄 Alinhar Local e Produção para usar SUPABASE

## Situação:
- ❌ Local usando Neon (dados lá)
- ❌ Vercel usando Supabase (vazio)
- ✅ Precisamos que TODOS usem Supabase

---

## Passos:

### 1️⃣ Pegar Connection String do Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Settings (engrenagem) → Database
4. Connection String → URI
5. Copie e **substitua [YOUR-PASSWORD]** pela senha real

Exemplo:
```
postgresql://postgres.vpnrglgmtfkystualadgzai:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

---

### 2️⃣ Atualizar .env LOCAL

No arquivo `.env` (na raiz do projeto), substitua:

```env
# ANTES (Neon):
DATABASE_URL=postgresql://neondb_owner:npg_...@ep-bold-waterfall...neon.tech/neondb

# DEPOIS (Supabase):
DATABASE_URL=postgresql://postgres.vpnrglgmtfkystualadgzai:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

---

### 3️⃣ Parar servidor e regenerar Prisma

```bash
# Parar servidor (Ctrl+C)

# Gerar Prisma Client
npx prisma generate

# Iniciar servidor
npm run dev
```

---

### 4️⃣ Recriar dados no Supabase

Como estava no Neon, vai precisar recriar:
- Restaurante
- Categorias
- Produtos

**OU** podemos migrar os dados do Neon para o Supabase.

---

## ✅ Após isso:

- Local e Produção usam o MESMO banco (Supabase)
- Dados sincronizados
- Tudo funcionando igual
