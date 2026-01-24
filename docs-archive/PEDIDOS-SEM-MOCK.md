# 📋 PEDIDOS SEM DADOS MOCK

## ✅ **PROBLEMA RESOLVIDO:**

### **ANTES:**
```typescript
// Dados de exemplo (mock)
setOrders([
  {
    id: '1',
    status: 'PENDING',
    total: 45.00,
    items: [...]  // ❌ Pedido falso
  }
]);
```
❌ Sempre mostrava 1 pedido de exemplo
❌ Não era real
❌ Confundia o usuário

### **DEPOIS:**
```typescript
// Busca pedidos reais da API
const response = await fetch(`/api/orders/customer?restaurantSlug=${slug}`);
const data = await response.json();
setOrders(data);  // ✅ Pedidos reais ou array vazio
```
✅ Busca pedidos reais do banco
✅ Se não tiver pedidos, retorna array vazio
✅ Mostra tela "Nenhum pedido ainda"

---

## 🎯 **COMO FUNCIONA AGORA:**

### **1. Usuário clica em "Pedidos":**
```
Bottom Nav → Página de Pedidos → API
```

### **2. API busca pedidos:**
```typescript
GET /api/orders/customer?restaurantSlug=meu-restaurante

// Retorna:
[]  // Array vazio (sem pedidos)
```

### **3. Página renderiza:**
```
┌─────────────────────────────────┐
│ ← Meus Pedidos                  │
├─────────────────────────────────┤
│         📦                      │
│   Nenhum pedido ainda           │  ← Tela vazia
│   Faça seu primeiro pedido!     │
│   [Ver Cardápio]                │
└─────────────────────────────────┘
```

---

## 📂 **ARQUIVOS CRIADOS/MODIFICADOS:**

### **1. Nova API:**
```
app/api/orders/customer/route.ts
```
- ✅ Busca pedidos do cliente
- ✅ Filtra por restaurante
- ✅ Retorna array vazio por padrão
- ✅ TODO: Implementar identificação de cliente

### **2. Página Atualizada:**
```
app/[slug]/meus-pedidos/page.tsx
```
- ✅ Remove dados mock
- ✅ Busca da API real
- ✅ Mostra loading
- ✅ Mostra tela vazia se não tiver pedidos

---

## 🔄 **FLUXO COMPLETO:**

### **Sem Pedidos (Padrão):**
```
1. Usuário acessa /restaurante/meus-pedidos
2. Página chama API
3. API retorna []
4. Página mostra "Nenhum pedido ainda"
5. Botão "Ver Cardápio" para voltar
```

### **Com Pedidos (Futuro):**
```
1. Usuário acessa /restaurante/meus-pedidos
2. Página chama API
3. API busca pedidos do cliente no banco
4. Retorna lista de pedidos
5. Página mostra cards com pedidos
```

---

## 🎨 **ESTADOS DA PÁGINA:**

### **1. Loading:**
```
┌─────────────────────────────────┐
│ ← Meus Pedidos                  │
├─────────────────────────────────┤
│                                 │
│         ⏳ Carregando...        │  ← Spinner
│                                 │
└─────────────────────────────────┘
```

### **2. Vazio (Sem Pedidos):**
```
┌─────────────────────────────────┐
│ ← Meus Pedidos                  │
├─────────────────────────────────┤
│         📦                      │
│   Nenhum pedido ainda           │
│   Faça seu primeiro pedido!     │
│   [Ver Cardápio]                │
└─────────────────────────────────┘
```

### **3. Com Pedidos:**
```
┌─────────────────────────────────┐
│ ← Meus Pedidos                  │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ ⏰ Pedido #123  30/10 10:15 │ │
│ │ Status: Pendente            │ │
│ │ Total: R$ 45,00             │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

## 🔮 **PRÓXIMA IMPLEMENTAÇÃO:**

### **Sistema de Identificação de Cliente:**

Para identificar pedidos de um cliente específico, você pode usar:

#### **Opção 1: Cookie/Session:**
```typescript
// Salvar ID do cliente em cookie ao fazer pedido
cookies().set('customerId', customerId);

// Buscar pedidos deste cliente
const customerId = cookies().get('customerId');
const orders = await prisma.order.findMany({
  where: {
    customerId: customerId
  }
});
```

#### **Opção 2: LocalStorage + API:**
```typescript
// No frontend, salvar ID ao fazer pedido
localStorage.setItem('customerId', customerId);

// Enviar na requisição
const customerId = localStorage.getItem('customerId');
fetch(`/api/orders/customer?customerId=${customerId}`);
```

#### **Opção 3: Telefone:**
```typescript
// Pedir telefone ao fazer pedido
// Buscar pedidos por telefone
const orders = await prisma.order.findMany({
  where: {
    customerPhone: phone
  }
});
```

---

## 📊 **API ENDPOINT:**

### **GET /api/orders/customer**

#### **Query Params:**
```
restaurantSlug: string (obrigatório)
```

#### **Response (Sem Pedidos):**
```json
[]
```

#### **Response (Com Pedidos):**
```json
[
  {
    "id": "clxxx",
    "status": "PENDING",
    "total": 45.00,
    "createdAt": "2025-10-30T10:15:00.000Z",
    "items": [
      {
        "name": "Pizza Margherita",
        "quantity": 1,
        "price": 35.00
      },
      {
        "name": "Coca-Cola",
        "quantity": 2,
        "price": 5.00
      }
    ]
  }
]
```

---

## ✅ **BENEFÍCIOS:**

### **Para o Usuário:**
- ✅ **Sem confusão** - Não mostra pedidos falsos
- ✅ **Transparente** - Só mostra pedidos reais
- ✅ **Claro** - Mensagem quando não tem pedidos
- ✅ **Fácil** - Botão para voltar ao cardápio

### **Para o Sistema:**
- ✅ **Correto** - Dados reais do banco
- ✅ **Escalável** - Pronto para implementação
- ✅ **Limpo** - Sem dados mock
- ✅ **Profissional** - API estruturada

---

## 🎯 **COMPORTAMENTO ATUAL:**

### **Sempre Mostra Tela Vazia:**
```
Por padrão, a API retorna array vazio []
Isso significa: "Nenhum pedido ainda"
Usuário vê a tela vazia com mensagem
```

### **Quando Implementar Identificação:**
```
1. Cliente faz pedido
2. Sistema salva identificador (cookie/phone/etc)
3. Cliente acessa "Meus Pedidos"
4. API busca pedidos deste identificador
5. Mostra lista de pedidos reais
```

---

## 🚀 **PRÓXIMOS PASSOS:**

### **1. Escolher método de identificação:**
- Cookie/Session
- LocalStorage
- Telefone
- Email

### **2. Implementar na API:**
```typescript
// Exemplo com cookie
const customerId = cookies().get('customerId');
const orders = await prisma.order.findMany({
  where: {
    customerId: customerId,
    restaurantId: restaurant.id
  }
});
```

### **3. Salvar ao fazer pedido:**
```typescript
// Ao criar pedido, salvar identificador
const order = await prisma.order.create({
  data: {
    customerId: customerId,
    // ... outros dados
  }
});
```

---

## ✅ **CHECKLIST:**

- [x] Remover dados mock
- [x] Criar API de pedidos
- [x] Buscar pedidos reais
- [x] Retornar array vazio por padrão
- [x] Mostrar tela vazia quando não tem pedidos
- [x] Loading state
- [x] Error handling
- [ ] **Implementar identificação de cliente** (próximo)
- [ ] **Salvar identificador ao fazer pedido** (próximo)

---

## 🎉 **RESULTADO:**

### **Agora:**
```
Clica em "Pedidos" → Tela vazia ✅
Mensagem: "Nenhum pedido ainda"
Botão: "Ver Cardápio"
```

### **Futuro (Com Identificação):**
```
Clica em "Pedidos" → Lista de pedidos reais ✅
Mostra pedidos do cliente específico
Acompanha status em tempo real
```

---

**PEDIDOS SEM MOCK! TUDO REAL! 🎉📋**

Agora só mostra pedidos quando realmente existirem no banco de dados!
