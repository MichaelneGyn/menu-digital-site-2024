# 🔄 Guia Completo de Migração: Neon → Supabase

## 📋 Checklist de Migração

- [ ] Passo 1: Exportar dados do Neon
- [ ] Passo 2: Atualizar .env local
- [ ] Passo 3: Importar dados no Supabase
- [ ] Passo 4: Testar funcionamento
- [ ] Passo 5: Atualizar Vercel (se necessário)

---

## 🚀 PASSO 1: Exportar Dados do Neon

### 1.1 - Acesse o Neon Console
1. Vá em: https://console.neon.tech
2. Faça login
3. Selecione seu projeto
4. Clique em **SQL Editor**

### 1.2 - Execute as queries de exportação

**Copie e execute UMA POR VEZ** as queries do arquivo `exportar-neon.sql`:

#### Query 1: Exportar Usuários
```sql
SELECT 
  'INSERT INTO "User" (id, name, email, "emailVerified", image, "createdAt", "updatedAt") VALUES (' ||
  quote_literal(id) || ', ' ||
  quote_literal(name) || ', ' ||
  quote_literal(email) || ', ' ||
  COALESCE(quote_literal("emailVerified"::text), 'NULL') || ', ' ||
  COALESCE(quote_literal(image), 'NULL') || ', ' ||
  quote_literal("createdAt"::text) || ', ' ||
  quote_literal("updatedAt"::text) || 
  ');'
FROM "User";
```

**Copie o resultado** (são as linhas INSERT) e salve em um arquivo de texto.

#### Query 2: Exportar Restaurantes
```sql
SELECT 
  'INSERT INTO "Restaurant" (id, name, "whatsapp", address, "openTime", "closeTime", "workingDays", slug, "pixKey", "pixQrCode", "userId", "createdAt", "updatedAt") VALUES (' ||
  quote_literal(id) || ', ' ||
  quote_literal(name) || ', ' ||
  COALESCE(quote_literal("whatsapp"), 'NULL') || ', ' ||
  COALESCE(quote_literal(address), 'NULL') || ', ' ||
  COALESCE(quote_literal("openTime"), 'NULL') || ', ' ||
  COALESCE(quote_literal("closeTime"), 'NULL') || ', ' ||
  COALESCE(quote_literal("workingDays"), 'NULL') || ', ' ||
  COALESCE(quote_literal(slug), 'NULL') || ', ' ||
  COALESCE(quote_literal("pixKey"), 'NULL') || ', ' ||
  COALESCE(quote_literal("pixQrCode"), 'NULL') || ', ' ||
  quote_literal("userId") || ', ' ||
  quote_literal("createdAt"::text) || ', ' ||
  quote_literal("updatedAt"::text) ||
  ');'
FROM "Restaurant";
```

**Copie o resultado** e adicione ao arquivo.

#### Query 3: Exportar Categorias
```sql
SELECT 
  'INSERT INTO "Category" (id, name, icon, "restaurantId", "createdAt", "updatedAt") VALUES (' ||
  quote_literal(id) || ', ' ||
  quote_literal(name) || ', ' ||
  quote_literal(icon) || ', ' ||
  quote_literal("restaurantId") || ', ' ||
  quote_literal("createdAt"::text) || ', ' ||
  quote_literal("updatedAt"::text) ||
  ');'
FROM "Category";
```

**Copie o resultado** e adicione ao arquivo.

#### Query 4: Exportar Itens do Menu
```sql
SELECT 
  'INSERT INTO "MenuItem" (id, name, description, price, image, "isPromo", "originalPrice", "restaurantId", "categoryId", "createdAt", "updatedAt") VALUES (' ||
  quote_literal(id) || ', ' ||
  quote_literal(name) || ', ' ||
  COALESCE(quote_literal(description), 'NULL') || ', ' ||
  price || ', ' ||
  COALESCE(quote_literal(image), 'NULL') || ', ' ||
  "isPromo" || ', ' ||
  COALESCE("originalPrice"::text, 'NULL') || ', ' ||
  quote_literal("restaurantId") || ', ' ||
  quote_literal("categoryId") || ', ' ||
  quote_literal("createdAt"::text) || ', ' ||
  quote_literal("updatedAt"::text) ||
  ');'
FROM "MenuItem";
```

**Copie o resultado** e adicione ao arquivo.

### 1.3 - Salvar INSERTs
Você deve ter um arquivo com vários INSERTs tipo:
```sql
INSERT INTO "User" (...) VALUES (...);
INSERT INTO "Restaurant" (...) VALUES (...);
INSERT INTO "Category" (...) VALUES (...);
INSERT INTO "MenuItem" (...) VALUES (...);
```

---

## 🔧 PASSO 2: Atualizar .env Local

### 2.1 - Pegar Connection String do Supabase

1. Vá em: https://supabase.com/dashboard
2. Selecione seu projeto
3. **Settings** (⚙️) → **Database**
4. **Connection String** → Seção **URI**
5. Copie a URL e **SUBSTITUA `[YOUR-PASSWORD]`** pela senha real

Exemplo:
```
postgresql://postgres.vpnrglgmtfkystualadgzai:SUA_SENHA_AQUI@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

### 2.2 - Editar .env

No arquivo `.env` na raiz do projeto, **SUBSTITUA** a linha do `DATABASE_URL`:

**ANTES:**
```env
DATABASE_URL=postgresql://neondb_owner:npg_...@ep-bold-waterfall...neon.tech/neondb
```

**DEPOIS:**
```env
DATABASE_URL=postgresql://postgres.vpnrglgmtfkystualadgzai:SUA_SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

**SALVE O ARQUIVO!**

---

## 📥 PASSO 3: Importar Dados no Supabase

### 3.1 - Acesse Supabase SQL Editor

1. Vá em: https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em **SQL Editor** (ícone </>)

### 3.2 - Execute os INSERTs

**Cole todos os INSERTs** que você copiou do Neon e clique em **RUN** ▶️

**IMPORTANTE:** Execute na ordem:
1. Primeiro: INSERTs de `User`
2. Segundo: INSERTs de `Restaurant`
3. Terceiro: INSERTs de `Category`
4. Quarto: INSERTs de `MenuItem`

Se der erro de "já existe", ignore (significa que já tem dados lá).

---

## 🔄 PASSO 4: Sincronizar Schema e Testar

### 4.1 - Parar o servidor local
```bash
# No terminal, pressione Ctrl+C
```

### 4.2 - Regenerar Prisma Client
```bash
npx prisma generate
```

### 4.3 - Reiniciar servidor
```bash
npm run dev
```

### 4.4 - Testar
Acesse: `http://localhost:3001/admin/dashboard`

**Deve aparecer:**
- ✅ Seus produtos
- ✅ Suas categorias
- ✅ Seu restaurante

---

## ✅ PASSO 5: Validar Vercel (Opcional)

O Vercel já está usando Supabase, então não precisa mexer!

Mas verifique se a variável `DATABASE_URL` no Vercel é a mesma do Supabase.

---

## 🎉 Migração Completa!

Após seguir todos os passos:
- ✅ Dados migrados para Supabase
- ✅ Local usando Supabase
- ✅ Produção usando Supabase
- ✅ Tudo sincronizado

---

## 🆘 Problemas?

### Erro: "duplicate key value violates unique constraint"
- **Causa:** Dado já existe no Supabase
- **Solução:** Ignore ou remova o INSERT duplicado

### Erro ao conectar
- **Causa:** Senha errada no DATABASE_URL
- **Solução:** Verifique a senha no Supabase

### Produtos não aparecem
- **Causa:** Schema não sincronizado
- **Solução:** Execute `npx prisma generate` novamente

---

**Qualquer dúvida, me chame!** 🚀
