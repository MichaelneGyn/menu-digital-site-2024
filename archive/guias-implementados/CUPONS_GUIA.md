# 🎟️ **SISTEMA DE CUPONS - GUIA COMPLETO**

---

## 🎯 **COMO FUNCIONA**

O sistema de cupons está **totalmente integrado** ao checkout e permite:
- Descontos percentuais (ex: 15% OFF)
- Descontos fixos (ex: R$ 10 OFF)
- Frete grátis
- Validação automática
- Remoção de cupom

---

## 💰 **CUPONS PRÉ-CONFIGURADOS**

### **Cupons Ativos:**

```typescript
PRIMEIRACOMPRA
├─ Tipo: Desconto fixo
├─ Valor: R$ 10,00 OFF
└─ Descrição: Para incentivar novos clientes

DESCONTO15
├─ Tipo: Desconto percentual
├─ Valor: 15% OFF no subtotal
└─ Descrição: Promoção geral

FRETEGRATIS
├─ Tipo: Desconto fixo
├─ Valor: Equivalente à taxa de entrega
└─ Descrição: Entrega gratuita
```

---

## 🛠️ **COMO ADICIONAR NOVOS CUPONS**

### **Localização:**
```
📁 components/delivery/checkout-flow.tsx
📍 Linha ~102 (função applyCoupon)
```

### **Código:**
```typescript
const validCoupons = [
  { 
    code: 'PRIMEIRACOMPRA', 
    discount: 10, 
    type: 'fixed' as const, 
    description: 'R$ 10 OFF na primeira compra' 
  },
  { 
    code: 'DESCONTO15', 
    discount: 15, 
    type: 'percent' as const, 
    description: '15% de desconto' 
  },
  { 
    code: 'FRETEGRATIS', 
    discount: deliveryConfig.deliveryFee, 
    type: 'fixed' as const, 
    description: 'Frete grátis' 
  },
  
  // ADICIONE NOVOS CUPONS AQUI:
  { 
    code: 'SEUCUPOM', 
    discount: 20, 
    type: 'percent' as const, 
    description: '20% de desconto' 
  },
];
```

---

## 📝 **TIPOS DE CUPONS**

### **1. Desconto Percentual:**
```typescript
{
  code: 'DESCONTO20',
  discount: 20,              // 20%
  type: 'percent',           // Tipo percentual
  description: '20% OFF'
}
```
**Cálculo:** `subtotal × (discount / 100)`  
**Exemplo:** Subtotal R$ 100 → Desconto R$ 20

### **2. Desconto Fixo:**
```typescript
{
  code: 'DEZ REAIS',
  discount: 10,              // R$ 10,00
  type: 'fixed',             // Tipo fixo
  description: 'R$ 10 OFF'
}
```
**Cálculo:** `discount`  
**Exemplo:** Subtotal R$ 100 → Desconto R$ 10

### **3. Frete Grátis:**
```typescript
{
  code: 'FRETEGRATIS',
  discount: deliveryConfig.deliveryFee,  // Taxa de entrega
  type: 'fixed',
  description: 'Frete grátis'
}
```
**Cálculo:** `deliveryFee`  
**Exemplo:** Taxa R$ 4 → Desconto R$ 4

---

## 🎨 **PERSONALIZAR CUPONS**

### **Cupons por Dia da Semana:**
```typescript
const today = new Date().getDay(); // 0=Dom, 1=Seg, ...

const validCoupons = [
  // Segunda-feira
  ...(today === 1 ? [{
    code: 'SEGUNDAFEIRA',
    discount: 10,
    type: 'percent' as const,
    description: '10% OFF nas segundas'
  }] : []),
  
  // Fim de semana
  ...(today === 0 || today === 6 ? [{
    code: 'FIMDESEMANA',
    discount: 15,
    type: 'percent' as const,
    description: '15% OFF no fim de semana'
  }] : []),
];
```

### **Cupons com Valor Mínimo:**
```typescript
const applyCoupon = () => {
  setCouponError('');
  
  const coupon = validCoupons.find(c => c.code === couponCode.toUpperCase());
  
  if (!coupon) {
    setCouponError('Cupom inválido');
    return;
  }
  
  // Verificar valor mínimo
  if (coupon.minValue && subtotal < coupon.minValue) {
    setCouponError(`Pedido mínimo de R$ ${coupon.minValue.toFixed(2)} para este cupom`);
    return;
  }
  
  setAppliedCoupon(coupon);
  toast.success(`Cupom aplicado!`);
};
```

### **Cupons com Data de Validade:**
```typescript
{
  code: 'BLACKFRIDAY',
  discount: 30,
  type: 'percent' as const,
  description: '30% OFF Black Friday',
  validUntil: new Date('2024-11-30')  // Válido até
}

// No applyCoupon:
if (coupon.validUntil && new Date() > coupon.validUntil) {
  setCouponError('Cupom expirado');
  return;
}
```

---

## 🔥 **IDEIAS DE CUPONS**

### **1. Marketing:**
```typescript
// Primeira compra
{ code: 'BEMVINDO', discount: 15, type: 'percent' }

// Indicação
{ code: 'INDIQUE10', discount: 10, type: 'fixed' }

// Aniversário
{ code: 'ANIVERSARIO', discount: 20, type: 'percent' }
```

### **2. Promoções Sazonais:**
```typescript
// Natal
{ code: 'NATAL2024', discount: 25, type: 'percent' }

// Black Friday
{ code: 'BLACKFRIDAY', discount: 40, type: 'percent' }

// Páscoa
{ code: 'PASCOA', discount: 15, type: 'fixed' }
```

### **3. Fidelização:**
```typescript
// Cliente frequente
{ code: 'VIP', discount: 20, type: 'percent' }

// Combo
{ code: 'COMBO', discount: 12, type: 'fixed' }

// Quantidade
{ code: 'ACIMA50', discount: 10, type: 'percent', minValue: 50 }
```

### **4. Dias Específicos:**
```typescript
// Terça-feira
{ code: 'TERÇAFEIRA', discount: 10, type: 'percent' }

// Horário
{ code: 'HORARIOALMOÇO', discount: 5, type: 'fixed' }
```

---

## 🎯 **ESTRATÉGIAS DE USO**

### **1. Aumentar Ticket Médio:**
```typescript
// Pedido acima de R$ 50
{ 
  code: 'ACIMA50', 
  discount: 10, 
  type: 'percent',
  minValue: 50 
}
```

### **2. Captar Novos Clientes:**
```typescript
// Primeira compra generosa
{ 
  code: 'PRIMEIRACOMPRA', 
  discount: 20, 
  type: 'fixed',
  firstOrderOnly: true 
}
```

### **3. Reduzir Abandono:**
```typescript
// Frete grátis para incentivar
{ 
  code: 'FRETEGRATIS', 
  discount: deliveryConfig.deliveryFee, 
  type: 'fixed' 
}
```

### **4. Dias Fracos:**
```typescript
// Aumentar vendas segunda/terça
const isWeakDay = [1, 2].includes(new Date().getDay());
{
  code: 'DIAFRACO',
  discount: 15,
  type: 'percent',
  enabled: isWeakDay
}
```

---

## 📊 **TRACKING DE CUPONS**

### **Para Monitorar Uso:**

```typescript
const applyCoupon = () => {
  // ... validações ...
  
  if (coupon) {
    // Salvar uso do cupom
    trackCouponUsage(coupon.code, subtotal, discount);
    
    setAppliedCoupon(coupon);
    toast.success(`Cupom aplicado!`);
  }
};

// Função de tracking
const trackCouponUsage = async (code: string, subtotal: number, discount: number) => {
  try {
    await fetch('/api/coupons/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        subtotal,
        discount,
        timestamp: new Date()
      })
    });
  } catch (error) {
    console.error('Erro ao rastrear cupom:', error);
  }
};
```

---

## 🔐 **SEGURANÇA**

### **Validações Importantes:**

```typescript
const applyCoupon = () => {
  // 1. Normalizar código
  const normalizedCode = couponCode.trim().toUpperCase();
  
  // 2. Verificar se existe
  const coupon = validCoupons.find(c => c.code === normalizedCode);
  if (!coupon) {
    setCouponError('Cupom inválido');
    return;
  }
  
  // 3. Verificar validade
  if (coupon.validUntil && new Date() > coupon.validUntil) {
    setCouponError('Cupom expirado');
    return;
  }
  
  // 4. Verificar valor mínimo
  if (coupon.minValue && subtotal < coupon.minValue) {
    setCouponError(`Pedido mínimo: R$ ${coupon.minValue.toFixed(2)}`);
    return;
  }
  
  // 5. Verificar limite de uso
  if (coupon.usageLimit && coupon.currentUsage >= coupon.usageLimit) {
    setCouponError('Cupom esgotado');
    return;
  }
  
  // 6. Aplicar
  setAppliedCoupon(coupon);
};
```

---

## 🚀 **IMPLEMENTAÇÃO AVANÇADA**

### **Sistema de Cupons via API:**

**1. Criar tabela no banco:**
```prisma
model Coupon {
  id          String   @id @default(cuid())
  code        String   @unique
  discount    Float
  type        String   // 'percent' | 'fixed'
  description String
  minValue    Float?
  validUntil  DateTime?
  usageLimit  Int?
  currentUsage Int     @default(0)
  isActive    Boolean  @default(true)
  restaurantId String
  createdAt   DateTime @default(now())
  
  restaurant  Restaurant @relation(fields: [restaurantId], references: [id])
}
```

**2. API para validar:**
```typescript
// app/api/coupons/validate/route.ts
export async function POST(req: Request) {
  const { code, restaurantId } = await req.json();
  
  const coupon = await prisma.coupon.findFirst({
    where: {
      code: code.toUpperCase(),
      restaurantId,
      isActive: true,
      OR: [
        { validUntil: null },
        { validUntil: { gte: new Date() } }
      ]
    }
  });
  
  if (!coupon) {
    return NextResponse.json({ error: 'Cupom inválido' }, { status: 400 });
  }
  
  if (coupon.usageLimit && coupon.currentUsage >= coupon.usageLimit) {
    return NextResponse.json({ error: 'Cupom esgotado' }, { status: 400 });
  }
  
  return NextResponse.json(coupon);
}
```

**3. Usar no checkout:**
```typescript
const applyCoupon = async () => {
  try {
    const response = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        code: couponCode, 
        restaurantId: restaurant.id 
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      setCouponError(error.error);
      return;
    }
    
    const coupon = await response.json();
    setAppliedCoupon(coupon);
    toast.success('Cupom aplicado!');
  } catch (error) {
    setCouponError('Erro ao validar cupom');
  }
};
```

---

## 📱 **UX DO CUPOM**

### **Interface Atual:**
```
┌────────────────────────────────┐
│ Subtotal:        R$ 50,00      │
│ Taxa:            R$ 4,00       │
│ Desconto (ABC):  -R$ 5,00  [x] │
│ ──────────────────────────     │
│ Total:           R$ 49,00      │
└────────────────────────────────┘

┌────────────────────────────────┐
│ Cupom de desconto              │
│ ┌──────────────┬──────────┐    │
│ │ Digite cupom │ [Aplicar]│    │
│ └──────────────┴──────────┘    │
└────────────────────────────────┘
```

### **Estados:**
- ✅ **Sem cupom:** Campo visível
- ✅ **Com cupom:** Mostra desconto + botão remover
- ❌ **Erro:** Mensagem em vermelho
- ✅ **Sucesso:** Toast de confirmação

---

## 🎉 **RESUMO**

### **Funcionalidades:**
✅ Cupons percentuais  
✅ Cupons fixos  
✅ Validação automática  
✅ Feedback visual  
✅ Remover cupom  
✅ Mostra no resumo  
✅ Inclui no WhatsApp  

### **Fácil Configurar:**
✅ Array simples  
✅ Sem banco necessário  
✅ Customizável  
✅ Escalável  

### **Pronto para:**
✅ Campanhas de marketing  
✅ Fidelização  
✅ Promoções  
✅ A/B testing  

---

## 💡 **DICA FINAL**

**Crie cupons estratégicos:**
- Curtos e memoráveis
- Com propósito claro
- Divulgue nas redes sociais
- Monitore o uso
- Ajuste conforme resultado

🎟️ **SISTEMA DE CUPONS PRONTO!**
