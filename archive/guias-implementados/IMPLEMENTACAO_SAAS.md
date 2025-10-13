# 🚀 **IMPLEMENTAÇÃO SISTEMA SAAS - FASE 1**

---

## ✅ **O QUE FOI FEITO ATÉ AGORA:**

### **1. Schema Prisma Atualizado**
```typescript
✅ Campo cpfCnpj no User (anti-fraude)
✅ Campo phone no User
✅ Model Subscription (gerenciar assinaturas)
✅ Model Payment (pagamentos via Mercado Pago)
✅ Model Coupon (sistema de cupons)
✅ Enums: SubscriptionStatus, PaymentStatus, CouponType
```

---

## ⚠️ **PRÓXIMOS PASSOS (IMPORTANTE):**

### **PASSO 1: Rodar Migration** 🔴 **OBRIGATÓRIO**

**Antes de continuar, PARE o servidor e rode:**

```bash
# PARE O SERVIDOR (Ctrl + C)

# Crie a migration
npx prisma migrate dev --name add_saas_features

# Gere o Prisma Client
npx prisma generate

# Reinicie o servidor
npm run dev
```

**⚠️ Isso vai:**
- Criar as novas tabelas: Subscription, Payment, Coupon
- Adicionar campos: cpfCnpj, phone no User
- Atualizar o banco de dados

---

## 📋 **ESTRUTURA IMPLEMENTADA:**

### **1. Subscription (Assinaturas)**
```typescript
interface Subscription {
  id: string
  userId: string
  status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED'
  plan: 'monthly' | 'yearly'
  amount: number
  trialEndsAt?: Date        // Data fim do trial (15 dias)
  currentPeriodStart: Date  // Início período atual
  currentPeriodEnd?: Date   // Fim período atual
  canceledAt?: Date
}
```

**Status:**
- `TRIAL` → Período de teste (15 dias)
- `ACTIVE` → Assinatura ativa e paga
- `PAST_DUE` → Pagamento atrasado
- `CANCELED` → Cancelada pelo usuário
- `EXPIRED` → Expirada (sem pagamento)

### **2. Payment (Pagamentos)**
```typescript
interface Payment {
  id: string
  userId: string
  subscriptionId?: string
  amount: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  paymentMethod?: 'pix' | 'credit_card'
  paymentProvider: 'mercadopago'
  providerPaymentId?: string
  providerData?: string     // JSON com dados do MP
  paidAt?: Date
}
```

### **3. Coupon (Cupons)**
```typescript
interface Coupon {
  id: string
  restaurantId: string
  code: string              // Ex: PRIMEIRACOMPRA
  type: 'FIXED' | 'PERCENT' // Fixo ou percentual
  discount: number          // Valor ou %
  description?: string
  minValue?: number         // Pedido mínimo
  maxUses?: number          // Limite total
  currentUses: number       // Usos até agora
  usesPerUser?: number      // Limite por usuário
  validFrom: Date
  validUntil?: Date
  isActive: boolean
}
```

---

## 🎯 **FUNCIONALIDADES A IMPLEMENTAR:**

### **✅ FASE 1A - Sistema de Cupons** (2-3h)
```
├─ API: GET /api/coupons (listar cupons do restaurante)
├─ API: POST /api/coupons (criar cupom)
├─ API: PUT /api/coupons (editar cupom)
├─ API: DELETE /api/coupons (deletar cupom)
├─ API: POST /api/coupons/validate (validar cupom no checkout)
├─ Página: /admin/coupons (CRUD de cupons)
└─ Integração com checkout existente
```

### **✅ FASE 1B - Sistema de Trial** (3-4h)
```
├─ Criar subscription automática no registro
├─ Trial de 15 dias automático
├─ Middleware de verificação de assinatura
├─ Bloqueio de recursos após trial
├─ Página de assinatura expirada
├─ Notificações (3 dias antes de vencer)
└─ Dashboard com status da assinatura
```

### **✅ FASE 1C - Integração Mercado Pago** (3-4h)
```
├─ Configurar credenciais MP
├─ API: POST /api/payments/create (gerar pagamento)
├─ API: POST /api/payments/webhook (receber notificações)
├─ Página: /admin/billing (pagamento)
├─ Gerar PIX via MP
├─ Processar cartão de crédito
└─ Atualizar subscription após pagamento
```

### **✅ FASE 1D - Anti-Fraude** (1-2h)
```
├─ Validar CPF/CNPJ único no registro
├─ Validar e-mail único
├─ Registrar IP no cadastro (opcional)
├─ Rate limiting no registro
└─ Alertas de múltiplas tentativas
```

---

## 💰 **MODELO DE NEGÓCIO:**

### **Planos Sugeridos:**
```
TRIAL (15 dias)
├─ Gratuito
├─ Todos os recursos
└─ 1 restaurante

MENSAL (R$ 49,90/mês)
├─ Todos os recursos
├─ 1 restaurante
├─ Suporte via WhatsApp
└─ Sem taxa de setup

ANUAL (R$ 499,00/ano)
├─ 16% desconto (2 meses grátis)
├─ Todos os recursos
├─ 1 restaurante
└─ Suporte prioritário
```

**Você pode ajustar os valores depois!**

---

## 🔐 **ANTI-FRAUDE:**

### **Implementado:**
```typescript
✅ CPF/CNPJ único por usuário
✅ E-mail único (já existia)
✅ Phone único (opcional)
```

### **Prevenções:**
1. **Não pode criar 2 contas com mesmo CPF/CNPJ**
2. **Não pode criar 2 contas com mesmo e-mail**
3. **Validação no registro**
4. **Máximo 1 trial por CPF/CNPJ**

### **Opcional (Fase 2):**
```
⏳ Verificação de IP
⏳ Device fingerprinting
⏳ Verificação de e-mail obrigatória
⏳ SMS verification
```

---

## 🎨 **INTERFACE ADMIN:**

### **Menu Lateral (Sidebar):**
```
Dashboard
├─ Restaurante
├─ Categorias  
├─ Produtos
├─ Pedidos
├─ 💰 CMV
├─ 🎟️ Cupons ← NOVO
├─ 💳 Assinatura ← NOVO
└─ Sair
```

### **Página de Cupons (/admin/coupons):**
```
┌────────────────────────────────────┐
│ 🎟️ Gerenciar Cupons               │
├────────────────────────────────────┤
│ [+ Criar Novo Cupom]               │
│                                    │
│ ┌──────────────────────────────┐   │
│ │ PRIMEIRACOMPRA               │   │
│ │ R$ 10 OFF | 50 usos          │   │
│ │ [Editar] [Desativar]         │   │
│ └──────────────────────────────┘   │
│                                    │
│ ┌──────────────────────────────┐   │
│ │ DESCONTO15                   │   │
│ │ 15% OFF | Ilimitado          │   │
│ │ [Editar] [Desativar]         │   │
│ └──────────────────────────────┘   │
└────────────────────────────────────┘
```

### **Página de Assinatura (/admin/subscription):**
```
┌────────────────────────────────────┐
│ 💳 Minha Assinatura                │
├────────────────────────────────────┤
│ Status: ✅ TRIAL (5 dias restantes)│
│ Plano: Gratuito                    │
│ Vence em: 23/01/2025               │
│                                    │
│ [Assinar Plano Mensal - R$ 49,90] │
│ [Assinar Plano Anual - R$ 499,00] │
│                                    │
│ Histórico de Pagamentos:           │
│ (vazio)                            │
└────────────────────────────────────┘
```

---

## 📱 **MERCADO PAGO:**

### **O que você precisa:**
```
1. Conta no Mercado Pago (grátis)
2. Access Token (production)
3. Public Key (production)
```

### **Como obter:**
```
1. Acesse: https://www.mercadopago.com.br
2. Crie uma conta (se não tiver)
3. Acesse: Seu perfil → Credenciais
4. Copie:
   - Public Key
   - Access Token
5. Cole no .env:
   MERCADOPAGO_ACCESS_TOKEN="..."
   MERCADOPAGO_PUBLIC_KEY="..."
```

### **Taxas Mercado Pago:**
```
PIX: 0,99% por transação
Cartão Crédito: ~3,99% por transação
Assinatura Recorrente: ~3,99% + R$ 0,39
```

---

## 🔄 **FLUXO COMPLETO:**

### **1. Novo Usuário:**
```
Usuário se registra
    ↓
Preenche: Nome, E-mail, Senha, CPF/CNPJ
    ↓
Sistema valida CPF/CNPJ único
    ↓
✅ Cria conta
    ↓
✅ Cria subscription com status TRIAL
    ↓
✅ Define trialEndsAt = hoje + 15 dias
    ↓
✅ Usuário entra no sistema
    ↓
✅ Usa TUDO por 15 dias
```

### **2. Após 15 Dias:**
```
Trial expira (trialEndsAt < hoje)
    ↓
Status muda para EXPIRED
    ↓
Middleware bloqueia acesso
    ↓
Redireciona para /admin/subscription
    ↓
Mostra: "⚠️ Trial expirado. Assine para continuar"
    ↓
Botões: [Assinar Mensal] [Assinar Anual]
```

### **3. Usuário Assina:**
```
Clica "Assinar Mensal"
    ↓
Redireciona para checkout Mercado Pago
    ↓
Escolhe PIX ou Cartão
    ↓
Paga R$ 49,90
    ↓
Mercado Pago confirma via webhook
    ↓
Sistema recebe notificação
    ↓
✅ Atualiza subscription para ACTIVE
    ↓
✅ Define currentPeriodEnd = +30 dias
    ↓
✅ Cria registro em Payment com status COMPLETED
    ↓
✅ Usuário volta ao sistema (desbloqueado)
```

### **4. Renovação Mensal:**
```
Opção A: Manual
├─ 3 dias antes de vencer: notificação
├─ Usuário acessa /admin/subscription
└─ Clica "Renovar" → Paga novamente

Opção B: Automática (Fase 2)
├─ Mercado Pago cobra automaticamente
├─ Webhook confirma pagamento
└─ Sistema renova automaticamente
```

---

## 🎯 **RECURSOS POR STATUS:**

### **TRIAL:**
```
✅ Criar restaurante
✅ Adicionar produtos
✅ Receber pedidos
✅ Sistema CMV
✅ Criar cupons
✅ Tudo liberado!
```

### **EXPIRED/CANCELED:**
```
❌ Criar/editar produtos
❌ Receber pedidos
❌ Criar cupons
✅ Ver dados (somente leitura)
✅ Acessar página de assinatura
```

### **ACTIVE:**
```
✅ Tudo liberado
✅ Sem restrições
```

---

## 📊 **DASHBOARD DE ADMIN:**

### **Badge de Status:**
```
No topo do admin, sempre visível:

[✅ TRIAL - 10 dias restantes]
ou
[⚠️ ASSINATURA EXPIRADA - Renovar]
ou
[✅ ATIVO - Válido até 23/02/2025]
```

---

## 🚀 **CRONOGRAMA:**

### **HOJE (Sessão 1):**
```
✅ Schema Prisma atualizado
⏳ Você roda migration
⏳ Implemento API de Cupons (2h)
```

### **AMANHÃ (Sessão 2):**
```
⏳ Interface Admin de Cupons (2h)
⏳ Sistema de Trial + Bloqueio (3h)
```

### **DEPOIS (Sessão 3):**
```
⏳ Integração Mercado Pago (3h)
⏳ Webhooks e pagamentos (2h)
```

### **DEPOIS (Sessão 4):**
```
⏳ Anti-fraude completo (2h)
⏳ Testes finais (2h)
```

**TOTAL: ~16 horas em 4 sessões**

---

## ⚠️ **IMPORTANTE AGORA:**

### **VOCÊ PRECISA FAZER:**

1. **Parar o servidor** (Ctrl + C)

2. **Rodar migration:**
```bash
npx prisma migrate dev --name add_saas_features
```

3. **Gerar Prisma Client:**
```bash
npx prisma generate
```

4. **Reiniciar servidor:**
```bash
npm run dev
```

5. **Avisar aqui** quando terminar!

---

## 📝 **CONFIGURAÇÕES .ENV:**

**Adicione ao seu .env:**
```env
# Mercado Pago (obter depois)
MERCADOPAGO_ACCESS_TOKEN="seu_access_token_aqui"
MERCADOPAGO_PUBLIC_KEY="sua_public_key_aqui"

# Planos (valores em centavos)
MONTHLY_PLAN_AMOUNT=4990  # R$ 49,90
YEARLY_PLAN_AMOUNT=49900  # R$ 499,00

# Trial
TRIAL_DAYS=15
```

---

## 🎉 **APÓS IMPLEMENTAÇÃO:**

### **Você terá:**
```
✅ Sistema SaaS completo
✅ Trial automático de 15 dias
✅ Bloqueio após trial
✅ Pagamentos via Mercado Pago
✅ PIX + Cartão de crédito
✅ Sistema de cupons admin
✅ Anti-fraude (CPF/CNPJ único)
✅ Dashboard de assinatura
✅ Histórico de pagamentos
✅ Pronto para vender!
```

---

## 💡 **PRECISA DECIDIR:**

### **Valores das Assinaturas:**
```
Mensal: R$ __________
Anual: R$ __________
```

### **Trial:**
```
15 dias está OK? ___
```

---

**🚀 AGUARDANDO VOCÊ RODAR AS MIGRATIONS PARA CONTINUAR!**

Me avise quando terminar! 😊
