# 🚀 PASSO A PASSO PARA DEPLOY

## ✅ **SIGA ESTA ORDEM:**

---

## 1️⃣ **ATUALIZAR BANCO DE DADOS (SUPABASE)**

### **Abra o Supabase SQL Editor:**
1. Acesse: https://supabase.com
2. Selecione seu projeto
3. Clique em "SQL Editor" no menu lateral
4. Clique em "New Query"

### **Execute este SQL:**

```sql
-- Adicionar campos de cores personalizáveis
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "headerColor" TEXT DEFAULT '#ffffff';
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "headerTextColor" TEXT DEFAULT '#000000';
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "backgroundColor" TEXT DEFAULT '#f5f5f5';
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "cardColor" TEXT DEFAULT '#ffffff';
```

### **Clique em "Run" (ou CTRL + Enter)**

✅ Deve aparecer: "Success. No rows returned"

---

## 2️⃣ **ATUALIZAR PRISMA CLIENT (LOCAL)**

### **No terminal do VS Code:**

```powershell
# Gerar novo Prisma Client com os campos novos
npx prisma generate
```

✅ Deve aparecer: "✔ Generated Prisma Client"

---

## 3️⃣ **TESTAR LOCALMENTE (OPCIONAL)**

### **Rodar o projeto local:**

```powershell
npm run dev
```

### **Abrir no navegador:**
```
http://localhost:3000/seu-restaurante
```

✅ Deve aparecer o banner com logo e menu colorido

---

## 4️⃣ **FAZER COMMIT E PUSH**

### **No terminal:**

```powershell
# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "feat: identidade visual personalizável - banner + menu sticky + cores + cookie + botões mobile"

# Enviar para o repositório
git push origin master
```

✅ Deve aparecer: "Everything up-to-date" ou "Branch 'master' set up to track..."

---

## 5️⃣ **DEPLOY AUTOMÁTICO (VERCEL)**

### **Vercel vai fazer deploy automático:**
1. Acesse: https://vercel.com
2. Vá em "Deployments"
3. Aguarde o deploy terminar (1-3 minutos)

✅ Status deve ficar: "Ready"

---

## 6️⃣ **VERIFICAR NO SITE ONLINE**

### **Abra seu site:**
```
https://seu-dominio.vercel.app/seu-restaurante
```

### **Verificar:**
- ✅ Banner com logo aparece
- ✅ Menu de categorias está colorido
- ✅ Botões mobile não cortam
- ✅ Carrinho está em formato pill
- ✅ Bottom nav está espaçado

---

## 7️⃣ **PERSONALIZAR CORES (OPCIONAL)**

### **No Supabase SQL Editor:**

```sql
-- Atualizar cores do seu restaurante
UPDATE "Restaurant"
SET 
  "primaryColor" = '#EA1D2C',      -- Vermelho (botões, bordas)
  "secondaryColor" = '#FFC107',    -- Amarelo (destaques)
  "headerColor" = '#EA1D2C',       -- Banner vermelho
  "headerTextColor" = '#FFFFFF'    -- Texto branco
WHERE slug = 'seu-restaurante';   -- ⚠️ TROCAR pelo slug real
```

### **Clique em "Run"**

✅ Deve aparecer: "Success. 1 rows affected"

---

## 🎨 **EXEMPLOS DE CORES:**

### **Vermelho e Amarelo (Padrão):**
```sql
UPDATE "Restaurant" SET 
  "primaryColor" = '#EA1D2C',
  "secondaryColor" = '#FFC107',
  "headerColor" = '#EA1D2C'
WHERE slug = 'seu-restaurante';
```

### **Verde e Laranja:**
```sql
UPDATE "Restaurant" SET 
  "primaryColor" = '#4CAF50',
  "secondaryColor" = '#FF9800',
  "headerColor" = '#4CAF50'
WHERE slug = 'seu-restaurante';
```

### **Azul e Rosa:**
```sql
UPDATE "Restaurant" SET 
  "primaryColor" = '#2196F3',
  "secondaryColor" = '#E91E63',
  "headerColor" = '#2196F3'
WHERE slug = 'seu-restaurante';
```

### **Roxo e Amarelo:**
```sql
UPDATE "Restaurant" SET 
  "primaryColor" = '#9C27B0',
  "secondaryColor" = '#FFC107',
  "headerColor" = '#9C27B0'
WHERE slug = 'seu-restaurante';
```

---

## ⚠️ **SE DER ERRO:**

### **Erro: "column already exists"**
✅ **Normal!** Significa que o campo já existe. Pode ignorar.

### **Erro: "relation does not exist"**
❌ **Problema!** Verifique se está no banco correto.

### **Erro no Prisma Generate:**
```powershell
# Limpar cache e tentar novamente
npx prisma generate --force
```

### **Erro no Deploy:**
```powershell
# Ver logs do Vercel
vercel logs
```

---

## 📋 **CHECKLIST FINAL:**

Antes de considerar pronto, verifique:

- [ ] SQL executado no Supabase (campos adicionados)
- [ ] `npx prisma generate` executado (client atualizado)
- [ ] Commit e push feitos (código enviado)
- [ ] Deploy do Vercel concluído (site atualizado)
- [ ] Banner aparece no site (logo + nome)
- [ ] Menu de categorias está colorido (sticky)
- [ ] Botões mobile não cortam (responsivos)
- [ ] Carrinho em formato pill (compacto)
- [ ] Bottom nav espaçado (bonito)
- [ ] Página de pedidos sem mock (dados reais)

---

## 🎉 **PRONTO!**

Se todos os itens acima estiverem ✅, seu sistema está completo com:

- ✅ Identidade visual personalizável
- ✅ Banner com logo
- ✅ Menu sticky colorido
- ✅ Sistema de cookie
- ✅ Botões mobile responsivos
- ✅ Carrinho compacto
- ✅ Bottom nav bonito
- ✅ Pedidos reais (sem mock)

---

## 📞 **SUPORTE:**

Se tiver algum erro, me envie:
1. Print do erro
2. Qual passo estava fazendo
3. Mensagem de erro completa

---

**BOA SORTE COM O DEPLOY! 🚀✨**
