# ⚡ GUIA RÁPIDO - Começar em 15 Minutos

## 🎯 Para quem comprou o código

Este guia te ajuda a colocar o sistema no ar **rapidamente**.

---

## ✅ Pré-requisitos (5 min)

### 1. Instalar Node.js
- Baixe: https://nodejs.org (versão 18+)
- Instale e reinicie o computador

### 2. Instalar Git (opcional)
- Baixe: https://git-scm.com
- Ou use o código em ZIP

---

## 🚀 Instalação (10 min)

### Passo 1: Abrir o Projeto

```bash
# Se tem Git:
cd menu-digital-site-2024

# Ou extraia o ZIP e abra a pasta no terminal
```

### Passo 2: Instalar

```bash
npm install
```

**Aguarde 2-5 minutos...**

### Passo 3: Configurar

```bash
# Copiar arquivo de exemplo
cp .env.example .env
```

**Edite o arquivo `.env`:**

```env
# Mínimo necessário:
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="cole-qualquer-texto-longo-aqui-123456789"
```

### Passo 4: Preparar Banco

```bash
npx prisma generate
npx prisma db push
```

### Passo 5: Iniciar

```bash
npm run dev
```

**Acesse:** http://localhost:3001

---

## 🎨 Primeiro Uso (5 min)

### 1. Criar Conta
- Acesse: http://localhost:3001/auth/register
- Preencha: Nome, Email, Senha
- Clique em "Registrar"

### 2. Criar Restaurante
- Nome do restaurante
- Slug (URL): ex: `meu-restaurante`
- Telefone
- Salvar

### 3. Adicionar Categoria
- Admin → Categorias
- Clique em "Nova Categoria"
- Nome: "Pizzas"
- Ícone: 🍕
- Salvar

### 4. Adicionar Produto
- Admin → Produtos
- Clique em "Novo Produto"
- Nome: "Pizza Margherita"
- Preço: 45.90
- Categoria: Pizzas
- Salvar

### 5. Ver Menu
- Acesse: http://localhost:3001/meu-restaurante
- Veja seu menu funcionando!

---

## 🌐 Colocar Online (Vercel - Grátis)

### 1. Criar Conta Vercel
- Acesse: https://vercel.com
- Faça login com GitHub

### 2. Importar Projeto
- New Project
- Import Git Repository
- Selecione seu repositório

### 3. Configurar Variáveis
- Environment Variables
- Adicione as mesmas do `.env`
- **IMPORTANTE:** Mude `NEXTAUTH_URL` para sua URL Vercel

### 4. Deploy
- Clique em "Deploy"
- Aguarde 2-3 minutos
- Pronto! Site no ar!

---

## 🗄️ Banco de Dados Online (Supabase - Grátis)

### Por que?
O banco local (`file:./dev.db`) **não funciona** na Vercel.

### Como fazer:

#### 1. Criar Conta Supabase
- Acesse: https://supabase.com
- Crie novo projeto
- Aguarde 2 minutos

#### 2. Copiar URL
- Settings → Database
- Copie "Connection String"

#### 3. Atualizar .env
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
```

#### 4. Atualizar Vercel
- Vercel → Settings → Environment Variables
- Atualize `DATABASE_URL`
- Redeploy

---

## 📸 Upload de Imagens (Cloudinary - Grátis)

### 1. Criar Conta
- Acesse: https://cloudinary.com/users/register_free
- Cadastre-se

### 2. Copiar Credenciais
- Dashboard → Account Details
- Copie: Cloud Name, API Key, API Secret

### 3. Adicionar no .env
```env
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="sua-api-key"
CLOUDINARY_API_SECRET="sua-api-secret"
```

### 4. Atualizar Vercel
- Adicione as 3 variáveis
- Redeploy

---

## ⚡ Comandos Úteis

```bash
# Iniciar servidor
npm run dev

# Parar servidor
Ctrl + C

# Reinstalar dependências
rm -rf node_modules
npm install

# Resetar banco de dados
npx prisma db push --force-reset

# Ver banco de dados
npx prisma studio
```

---

## 🐛 Problemas Comuns

### "Prisma Client not found"
```bash
npx prisma generate
```

### "Port 3001 already in use"
```bash
# Mude a porta no package.json:
"dev": "next dev -p 3002"
```

### "Database connection failed"
- Verifique `DATABASE_URL` no `.env`
- Use banco local para testar: `file:./dev.db`

### "Upload failed"
- Configure Cloudinary (ver seção acima)
- Ou use URLs externas temporariamente

---

## 📞 Precisa de Ajuda?

### Documentação Completa
- `README.md` - Visão geral
- `DOCUMENTACAO-COMPLETA.md` - Guia detalhado

### Recursos
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://prisma.io/docs
- **Supabase Docs:** https://supabase.com/docs

---

## ✅ Checklist Rápido

- [ ] Node.js instalado
- [ ] Projeto aberto no terminal
- [ ] `npm install` executado
- [ ] `.env` configurado
- [ ] `npx prisma generate` executado
- [ ] `npm run dev` rodando
- [ ] Conta criada
- [ ] Restaurante criado
- [ ] Categoria adicionada
- [ ] Produto adicionado
- [ ] Menu funcionando

---

## 🎉 Pronto em 15 Minutos!

Seu sistema está funcionando localmente!

**Próximos passos:**
1. ✅ Adicione mais produtos
2. ✅ Personalize cores e logo
3. ✅ Configure Supabase (banco online)
4. ✅ Configure Cloudinary (upload)
5. ✅ Deploy na Vercel
6. ✅ Compartilhe seu menu!

**Sucesso!** 🚀
