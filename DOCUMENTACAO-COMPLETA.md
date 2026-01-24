# 📚 DOCUMENTAÇÃO COMPLETA - Menu Digital

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Instalação Passo a Passo](#instalação-passo-a-passo)
3. [Configuração](#configuração)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Funcionalidades](#funcionalidades)
6. [API Reference](#api-reference)
7. [Customização](#customização)
8. [Deploy](#deploy)
9. [Troubleshooting](#troubleshooting)
10. [Suporte](#suporte)

---

## 🎯 Visão Geral

Sistema completo de cardápio digital para restaurantes com:
- ✅ Menu digital responsivo
- ✅ Sistema de pedidos
- ✅ Painel administrativo
- ✅ Gestão de produtos e categorias
- ✅ Sistema CMV (Custo de Mercadoria Vendida)
- ✅ Cupons de desconto
- ✅ Integração WhatsApp

### Tecnologias Utilizadas

```
Frontend:     Next.js 14 + React 18 + TypeScript 5.2
Backend:      Next.js API Routes
Database:     PostgreSQL (Supabase)
ORM:          Prisma 6.7
Auth:         NextAuth.js
Styling:      Tailwind CSS 3.3
UI:           Radix UI + shadcn/ui
Upload:       Cloudinary
```

---

## 🚀 Instalação Passo a Passo

### Pré-requisitos

```bash
Node.js 18+ instalado
npm ou yarn
Git
```

### Passo 1: Clonar o Repositório

```bash
git clone [URL-DO-REPOSITORIO]
cd menu-digital-site-2024
```

### Passo 2: Instalar Dependências

```bash
npm install
```

**Tempo estimado:** 2-5 minutos

### Passo 3: Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais (ver seção [Configuração](#configuração))

### Passo 4: Configurar Banco de Dados

```bash
# Gerar Prisma Client
npx prisma generate

# Criar banco de dados e tabelas
npx prisma db push

# (Opcional) Popular com dados de exemplo
npx prisma db seed
```

### Passo 5: Iniciar Servidor

```bash
npm run dev
```

Acesse: **http://localhost:3001**

---

## ⚙️ Configuração

### 1. Banco de Dados (Supabase)

**Criar conta grátis:**
1. Acesse: https://supabase.com
2. Crie novo projeto
3. Copie a URL e as chaves

**Configurar no .env:**
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-anon-key"
SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key"
```

### 2. Autenticação (NextAuth)

**Gerar secret:**
```bash
openssl rand -base64 32
```

**Configurar no .env:**
```env
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="cole-o-secret-gerado-aqui"
```

### 3. Upload de Imagens (Cloudinary)

**Criar conta grátis:**
1. Acesse: https://cloudinary.com/users/register_free
2. Copie: Cloud Name, API Key, API Secret

**Configurar no .env:**
```env
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="sua-api-key"
CLOUDINARY_API_SECRET="sua-api-secret"
```

### 4. Admin API Key

**Gerar chave:**
```bash
openssl rand -hex 32
```

**Configurar no .env:**
```env
ADMIN_API_KEY="cole-a-chave-gerada-aqui"
```

---

## 📁 Estrutura do Projeto

```
menu-digital-site-2024/
│
├── app/                          # Next.js App Router
│   ├── admin/                    # Painel Administrativo
│   │   ├── cmv/                 # Sistema CMV
│   │   ├── categories/          # Gestão de Categorias
│   │   ├── products/            # Gestão de Produtos
│   │   ├── orders/              # Gestão de Pedidos
│   │   └── settings/            # Configurações
│   │
│   ├── auth/                     # Autenticação
│   │   ├── login/               # Página de Login
│   │   └── register/            # Página de Registro
│   │
│   ├── api/                      # API Routes
│   │   ├── auth/                # Endpoints de Auth
│   │   ├── products/            # CRUD Produtos
│   │   ├── categories/          # CRUD Categorias
│   │   ├── orders/              # CRUD Pedidos
│   │   └── upload/              # Upload de Imagens
│   │
│   ├── [slug]/                   # Menu Público (dinâmico)
│   │   └── page.tsx             # Página do Menu
│   │
│   ├── layout.tsx                # Layout Principal
│   └── page.tsx                  # Landing Page
│
├── components/                   # Componentes React
│   ├── menu/                    # Componentes do Menu
│   │   ├── ProductCard.tsx      # Card de Produto
│   │   ├── CategoryNav.tsx      # Navegação de Categorias
│   │   └── CartFloat.tsx        # Carrinho Flutuante
│   │
│   ├── delivery/                # Sistema de Checkout
│   │   ├── checkout-flow.tsx    # Fluxo de Checkout
│   │   └── address-form.tsx     # Formulário de Endereço
│   │
│   ├── admin/                   # Componentes Admin
│   │   ├── Sidebar.tsx          # Menu Lateral
│   │   └── Dashboard.tsx        # Dashboard
│   │
│   └── ui/                      # UI Components (shadcn)
│       ├── button.tsx
│       ├── input.tsx
│       └── ...
│
├── lib/                         # Utilitários
│   ├── auth.ts                  # Configuração NextAuth
│   ├── db.ts                    # Prisma Client
│   ├── restaurant.ts            # Utils Restaurante
│   └── utils.ts                 # Funções Auxiliares
│
├── prisma/                      # Prisma ORM
│   ├── schema.prisma            # Schema do Banco
│   └── seed.ts                  # Dados Iniciais
│
├── public/                      # Assets Estáticos
│   ├── images/
│   └── icons/
│
├── .env                         # Variáveis de Ambiente (não versionar)
├── .env.example                 # Exemplo de .env
├── package.json                 # Dependências
├── tsconfig.json                # Config TypeScript
├── tailwind.config.ts           # Config Tailwind
└── next.config.js               # Config Next.js
```

---

## 🎯 Funcionalidades

### Para o Cliente Final

#### 1. Menu Digital
- Visualização de produtos por categoria
- Busca de produtos
- Filtros (vegetariano, sem glúten, etc)
- Imagens em alta qualidade

#### 2. Carrinho de Compras
- Adicionar/remover produtos
- Personalização (tamanhos, sabores, extras)
- Cálculo automático de total
- Aplicar cupons de desconto

#### 3. Checkout
- **Etapa 1:** Revisão do pedido
- **Etapa 2:** Endereço de entrega (validação automática)
- **Etapa 3:** Forma de pagamento
- **Etapa 4:** Confirmação

#### 4. Integração WhatsApp
- Envio automático do pedido
- Mensagem formatada
- Link direto para chat

### Para o Restaurante

#### 1. Dashboard Administrativo
- Visão geral de vendas
- Pedidos recentes
- Produtos mais vendidos
- Gráficos e estatísticas

#### 2. Gestão de Produtos
- Criar/editar/excluir produtos
- Upload de imagens
- Definir preços e variações
- Ativar/desativar produtos

#### 3. Gestão de Categorias
- Criar categorias personalizadas
- Ordenar categorias
- Ícones customizados

#### 4. Sistema CMV
- Cadastro de ingredientes
- Histórico de preços
- Receitas vinculadas a produtos
- Cálculo automático de custo
- Análise de rentabilidade
- Relatórios detalhados

#### 5. Cupons de Desconto
- Cupons percentuais (ex: 15% OFF)
- Cupons fixos (ex: R$ 10 OFF)
- Frete grátis
- Validação automática

#### 6. Personalização
- Cores do tema
- Logo e banner
- Informações de contato
- Horários de funcionamento
- Taxa de entrega

---

## 🔌 API Reference

### Autenticação

#### POST `/api/auth/register`
Registrar novo usuário

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "123",
    "name": "João Silva",
    "email": "joao@email.com"
  }
}
```

### Produtos

#### GET `/api/products`
Listar todos os produtos

**Query Params:**
- `restaurantId` (required)
- `categoryId` (optional)

**Response:**
```json
{
  "products": [
    {
      "id": "1",
      "name": "Pizza Margherita",
      "price": 45.90,
      "image": "url",
      "category": "Pizzas"
    }
  ]
}
```

#### POST `/api/products`
Criar novo produto

**Headers:**
```
Authorization: Bearer [token]
```

**Body:**
```json
{
  "name": "Pizza Margherita",
  "description": "Molho de tomate, mussarela, manjericão",
  "price": 45.90,
  "categoryId": "cat-123",
  "image": "url"
}
```

#### PUT `/api/products/[id]`
Atualizar produto

#### DELETE `/api/products/[id]`
Deletar produto

### Categorias

#### GET `/api/categories`
Listar categorias

#### POST `/api/categories`
Criar categoria

#### PUT `/api/categories/[id]`
Atualizar categoria

#### DELETE `/api/categories/[id]`
Deletar categoria

### Pedidos

#### GET `/api/orders`
Listar pedidos

#### POST `/api/orders`
Criar pedido

#### PUT `/api/orders/[id]`
Atualizar status do pedido

### Upload

#### POST `/api/upload`
Upload de imagem

**Body:** FormData com arquivo

**Response:**
```json
{
  "url": "https://cloudinary.com/..."
}
```

---

## 🎨 Customização

### Cores do Tema

Edite `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#FF6B35', // Laranja
        50: '#FFF5F2',
        // ...
      }
    }
  }
}
```

### Logo e Banner

Upload via painel admin:
1. Acesse `/admin/settings`
2. Clique em "Personalização"
3. Upload de logo/banner
4. Salvar

### Informações do Restaurante

```typescript
// lib/restaurant.ts
export const restaurantConfig = {
  name: 'Seu Restaurante',
  phone: '(11) 99999-9999',
  address: 'Rua Exemplo, 123',
  deliveryFee: 5.00,
  minOrder: 20.00
}
```

---

## 🚀 Deploy

### Vercel (Recomendado)

#### 1. Conectar Repositório

```bash
npm i -g vercel
vercel login
vercel
```

#### 2. Configurar Variáveis de Ambiente

No dashboard da Vercel:
1. Settings → Environment Variables
2. Adicione todas as variáveis do `.env`

#### 3. Deploy

```bash
git push origin main
```

Deploy automático!

### Outras Plataformas

- **Railway:** https://railway.app
- **Netlify:** https://netlify.com
- **AWS:** Amplify ou EC2

---

## 🐛 Troubleshooting

### Erro: "Prisma Client not found"

**Solução:**
```bash
npx prisma generate
npm run dev
```

### Erro: "Database connection failed"

**Solução:**
1. Verifique `DATABASE_URL` no `.env`
2. Teste conexão:
```bash
npx prisma db pull
```

### Erro: "NextAuth configuration error"

**Solução:**
1. Verifique `NEXTAUTH_SECRET` no `.env`
2. Gere novo secret:
```bash
openssl rand -base64 32
```

### Erro: "Upload failed"

**Solução:**
1. Verifique credenciais Cloudinary
2. Teste upload manual no dashboard

### Erro 500 no Sistema CMV

**Solução:**
```bash
npx prisma generate
npx prisma db push
npm run dev
```

---

## 📞 Suporte

### Documentação Adicional

- `README.md` - Visão geral
- `SISTEMA_COMPLETO.md` - Funcionalidades
- `CUPONS_GUIA.md` - Sistema de cupons
- `CHECKLIST_FINAL.md` - Checklist

### Recursos Externos

- **Next.js:** https://nextjs.org/docs
- **Prisma:** https://prisma.io/docs
- **Tailwind:** https://tailwindcss.com/docs
- **Supabase:** https://supabase.com/docs

### Comunidades

- **Stack Overflow:** https://stackoverflow.com/questions/tagged/next.js
- **Discord Next.js:** https://discord.gg/nextjs
- **Reddit:** r/nextjs

---

## ✅ Checklist de Instalação

- [ ] Node.js 18+ instalado
- [ ] Repositório clonado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado
- [ ] Conta Supabase criada
- [ ] Banco de dados configurado (`npx prisma generate`)
- [ ] Conta Cloudinary criada (opcional)
- [ ] Servidor rodando (`npm run dev`)
- [ ] Primeiro usuário criado
- [ ] Restaurante configurado
- [ ] Primeira categoria criada
- [ ] Primeiro produto adicionado
- [ ] Teste de pedido realizado

---

## 🎉 Pronto!

Sistema instalado e configurado com sucesso!

**Próximos passos:**
1. Personalize as cores e logo
2. Adicione seus produtos
3. Configure cupons de desconto
4. Teste o fluxo completo
5. Faça deploy em produção

**Boa sorte com seu negócio!** 🚀
