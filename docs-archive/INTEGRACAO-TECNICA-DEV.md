# 🔧 DOCUMENTAÇÃO TÉCNICA: INTEGRAÇÕES DE DELIVERY

## 📋 ÍNDICE
1. [Arquitetura](#arquitetura)
2. [Banco de Dados](#banco-de-dados)
3. [APIs Criadas](#apis-criadas)
4. [Implementação por Plataforma](#implementação-por-plataforma)
5. [Webhooks](#webhooks)
6. [Sincronização](#sincronização)
7. [Testes](#testes)
8. [Deploy](#deploy)

---

## 🏗️ ARQUITETURA

### **Visão Geral**

```
┌─────────────────────────────────────────────────────┐
│                   PLATAFORMAS                       │
│  iFood │ 99Food │ Rappi │ Uber Eats │ aiqfome     │
└────────┬────────┬────────┬───────────┬─────────────┘
         │        │        │           │
         ▼        ▼        ▼           ▼
┌─────────────────────────────────────────────────────┐
│              WEBHOOKS / POLLING                     │
│  /api/webhooks/ifood                               │
│  /api/webhooks/99food                              │
│  /api/webhooks/rappi                               │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│           PROCESSADOR DE PEDIDOS                    │
│  - Validação                                       │
│  - Normalização                                    │
│  - Armazenamento                                   │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│              BANCO DE DADOS                         │
│  - integrations                                    │
│  - external_orders                                 │
│  - product_sync                                    │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│            DASHBOARD UNIFICADO                      │
│  /admin/integrations                               │
│  /admin/orders (todos os pedidos)                 │
└─────────────────────────────────────────────────────┘
```

---

## 💾 BANCO DE DADOS

### **Tabelas Criadas**

#### **1. `integrations`**
Armazena configurações de cada integração.

```sql
CREATE TABLE integrations (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'ifood', '99food', etc
  display_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  
  -- Credenciais (criptografar em produção)
  client_id TEXT,
  client_secret TEXT,
  api_key TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  
  -- Configurações
  webhook_url TEXT,
  store_id TEXT,
  merchant_id TEXT,
  auto_accept_orders BOOLEAN DEFAULT false,
  auto_sync_menu BOOLEAN DEFAULT true,
  
  -- Status
  sync_status TEXT DEFAULT 'pending',
  last_sync_at TIMESTAMP,
  last_error TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **2. `external_orders`**
Pedidos recebidos das plataformas.

```sql
CREATE TABLE external_orders (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL,
  integration_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  external_order_id TEXT NOT NULL,
  
  -- Dados completos (JSON)
  order_data JSONB NOT NULL,
  
  -- Status
  status TEXT NOT NULL,
  platform_status TEXT,
  
  -- Cliente
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  
  -- Valores
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **3. `product_sync`**
Sincronização de produtos.

```sql
CREATE TABLE product_sync (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL,
  integration_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  external_product_id TEXT,
  sync_status TEXT DEFAULT 'pending',
  last_sync_at TIMESTAMP
);
```

---

## 🔌 APIs CRIADAS

### **1. GET /api/integrations**
Lista todas as integrações do restaurante.

**Response:**
```json
[
  {
    "id": "int_123",
    "platform": "ifood",
    "displayName": "iFood",
    "isActive": true,
    "syncStatus": "synced",
    "lastSyncAt": "2024-11-09T18:00:00Z"
  }
]
```

### **2. POST /api/integrations**
Cria ou atualiza uma integração.

**Request:**
```json
{
  "platform": "ifood",
  "client_id": "abc123",
  "client_secret": "secret456",
  "store_id": "store789",
  "auto_accept_orders": false,
  "auto_sync_menu": true
}
```

### **3. PATCH /api/integrations/[id]**
Atualiza configurações.

**Request:**
```json
{
  "is_active": true,
  "auto_accept_orders": true
}
```

### **4. POST /api/integrations/[id]/sync**
Força sincronização manual.

---

## 🍔 IMPLEMENTAÇÃO POR PLATAFORMA

### **iFood**

#### **Autenticação: OAuth 2.0**

```typescript
// lib/integrations/ifood-client.ts
import axios from 'axios';

export class IFoodClient {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async authenticate() {
    const response = await axios.post(
      'https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token',
      {
        grantType: 'client_credentials',
        clientId: this.clientId,
        clientSecret: this.clientSecret
      }
    );
    
    this.accessToken = response.data.accessToken;
    return this.accessToken;
  }

  async getOrders(storeId: string) {
    if (!this.accessToken) await this.authenticate();
    
    const response = await axios.get(
      `https://merchant-api.ifood.com.br/order/v1.0/events:polling`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        },
        params: {
          merchantId: storeId
        }
      }
    );
    
    return response.data;
  }

  async confirmOrder(orderId: string) {
    const response = await axios.post(
      `https://merchant-api.ifood.com.br/order/v1.0/orders/${orderId}/confirm`,
      {},
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      }
    );
    
    return response.data;
  }

  async updateOrderStatus(orderId: string, status: string) {
    const statusMap: any = {
      preparing: 'INTEGRATED',
      ready: 'READY_TO_PICKUP',
      dispatched: 'DISPATCHED',
      delivered: 'CONCLUDED'
    };

    const response = await axios.post(
      `https://merchant-api.ifood.com.br/order/v1.0/orders/${orderId}/status`,
      {
        status: statusMap[status]
      },
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      }
    );
    
    return response.data;
  }
}
```

#### **Webhook do iFood**

```typescript
// app/api/webhooks/ifood/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar assinatura do webhook
    const signature = request.headers.get('x-ifood-signature');
    if (!validateSignature(body, signature)) {
      return new NextResponse('Invalid signature', { status: 401 });
    }

    // Processar evento
    const { eventType, orderId, merchantId } = body;

    if (eventType === 'ORDER_PLACED') {
      // Buscar integração
      const integration = await prisma.integration.findFirst({
        where: {
          platform: 'ifood',
          storeId: merchantId,
          isActive: true
        }
      });

      if (!integration) {
        return new NextResponse('Integration not found', { status: 404 });
      }

      // Buscar detalhes do pedido
      const ifoodClient = new IFoodClient(
        integration.clientId!,
        integration.clientSecret!
      );
      
      const orderDetails = await ifoodClient.getOrderDetails(orderId);

      // Salvar pedido
      await prisma.externalOrder.create({
        data: {
          restaurantId: integration.restaurantId,
          integrationId: integration.id,
          platform: 'ifood',
          externalOrderId: orderId,
          orderData: orderDetails,
          status: 'pending',
          totalAmount: orderDetails.total,
          customerName: orderDetails.customer.name,
          customerPhone: orderDetails.customer.phone
        }
      });

      // Se auto-aceitar está ativo
      if (integration.autoAcceptOrders) {
        await ifoodClient.confirmOrder(orderId);
      }

      // Notificar restaurante (WebSocket, Push, etc)
      // await notifyRestaurant(integration.restaurantId, orderDetails);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro no webhook iFood:', error);
    return new NextResponse('Error', { status: 500 });
  }
}

function validateSignature(body: any, signature: string | null): boolean {
  // Implementar validação de assinatura
  // const hash = crypto.createHmac('sha256', webhookSecret)
  //   .update(JSON.stringify(body))
  //   .digest('hex');
  // return hash === signature;
  return true; // Simplificado
}
```

---

### **99Food**

#### **Autenticação: API Key**

```typescript
// lib/integrations/99food-client.ts
import axios from 'axios';

export class NineNineFoodClient {
  private apiKey: string;
  private merchantId: string;

  constructor(apiKey: string, merchantId: string) {
    this.apiKey = apiKey;
    this.merchantId = merchantId;
  }

  async getOrders() {
    const response = await axios.get(
      `https://api.99food.com/v1/merchants/${this.merchantId}/orders`,
      {
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  }

  async acceptOrder(orderId: string) {
    const response = await axios.post(
      `https://api.99food.com/v1/orders/${orderId}/accept`,
      {},
      {
        headers: {
          'X-API-Key': this.apiKey
        }
      }
    );
    
    return response.data;
  }

  async updateStatus(orderId: string, status: string) {
    const response = await axios.patch(
      `https://api.99food.com/v1/orders/${orderId}`,
      { status },
      {
        headers: {
          'X-API-Key': this.apiKey
        }
      }
    );
    
    return response.data;
  }
}
```

---

### **Rappi, Uber Eats, aiqfome**

Seguem estrutura similar:
- Autenticação (OAuth ou API Key)
- Endpoints para buscar pedidos
- Endpoints para atualizar status
- Webhooks para receber notificações

---

## 🔄 SINCRONIZAÇÃO

### **Polling (Buscar Pedidos Periodicamente)**

```typescript
// lib/integrations/sync-orders.ts
import { prisma } from '@/lib/prisma';
import { IFoodClient } from './ifood-client';
import { NineNineFoodClient } from './99food-client';

export async function syncOrders() {
  // Buscar todas as integrações ativas
  const integrations = await prisma.integration.findMany({
    where: { isActive: true }
  });

  for (const integration of integrations) {
    try {
      let orders = [];

      if (integration.platform === 'ifood') {
        const client = new IFoodClient(
          integration.clientId!,
          integration.clientSecret!
        );
        orders = await client.getOrders(integration.storeId!);
      } else if (integration.platform === '99food') {
        const client = new NineNineFoodClient(
          integration.apiKey!,
          integration.merchantId!
        );
        orders = await client.getOrders();
      }
      // ... outras plataformas

      // Processar pedidos
      for (const order of orders) {
        await processOrder(integration, order);
      }

      // Atualizar status da integração
      await prisma.integration.update({
        where: { id: integration.id },
        data: {
          lastSyncAt: new Date(),
          syncStatus: 'synced'
        }
      });
    } catch (error) {
      console.error(`Erro ao sincronizar ${integration.platform}:`, error);
      
      await prisma.integration.update({
        where: { id: integration.id },
        data: {
          syncStatus: 'error',
          lastError: error.message
        }
      });
    }
  }
}

async function processOrder(integration: any, orderData: any) {
  // Verificar se já existe
  const existing = await prisma.externalOrder.findFirst({
    where: {
      integrationId: integration.id,
      externalOrderId: orderData.id
    }
  });

  if (existing) {
    // Atualizar se status mudou
    if (existing.platformStatus !== orderData.status) {
      await prisma.externalOrder.update({
        where: { id: existing.id },
        data: {
          platformStatus: orderData.status,
          orderData: orderData,
          updatedAt: new Date()
        }
      });
    }
  } else {
    // Criar novo
    await prisma.externalOrder.create({
      data: {
        restaurantId: integration.restaurantId,
        integrationId: integration.id,
        platform: integration.platform,
        externalOrderId: orderData.id,
        orderData: orderData,
        status: 'pending',
        totalAmount: orderData.total,
        customerName: orderData.customer?.name,
        customerPhone: orderData.customer?.phone
      }
    });
  }
}
```

### **Cron Job (Executar Periodicamente)**

```typescript
// app/api/cron/sync-orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { syncOrders } from '@/lib/integrations/sync-orders';

export async function GET(request: NextRequest) {
  // Validar token de segurança
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await syncOrders();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro no cron:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
```

**Configurar no Vercel:**
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/sync-orders",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

---

## 🧪 TESTES

### **Teste Manual**

1. Configure uma integração
2. Faça um pedido de teste na plataforma
3. Verifique se aparece no painel
4. Atualize o status
5. Verifique se sincronizou

### **Teste Automatizado**

```typescript
// __tests__/integrations/ifood.test.ts
import { IFoodClient } from '@/lib/integrations/ifood-client';

describe('IFood Integration', () => {
  it('should authenticate', async () => {
    const client = new IFoodClient('test_id', 'test_secret');
    const token = await client.authenticate();
    expect(token).toBeDefined();
  });

  it('should get orders', async () => {
    const client = new IFoodClient('test_id', 'test_secret');
    await client.authenticate();
    const orders = await client.getOrders('store_123');
    expect(Array.isArray(orders)).toBe(true);
  });
});
```

---

## 🚀 DEPLOY

### **Variáveis de Ambiente**

```env
# Cron Secret
CRON_SECRET=your_secret_here

# Webhook Secrets
IFOOD_WEBHOOK_SECRET=ifood_secret
99FOOD_WEBHOOK_SECRET=99food_secret
RAPPI_WEBHOOK_SECRET=rappi_secret
```

### **Checklist de Deploy**

- [ ] Migrar banco de dados
- [ ] Configurar variáveis de ambiente
- [ ] Configurar cron jobs
- [ ] Configurar webhooks nas plataformas
- [ ] Testar em produção
- [ ] Monitorar logs

---

## 📊 MONITORAMENTO

### **Logs Importantes**

```typescript
// Sempre logar:
console.log('[iFood] Pedido recebido:', orderId);
console.log('[99Food] Status atualizado:', status);
console.error('[Rappi] Erro:', error);
```

### **Métricas**

- Pedidos recebidos por plataforma
- Tempo de sincronização
- Taxa de erro
- Latência de webhooks

---

## 🎯 PRÓXIMOS PASSOS

1. **Implementar cada plataforma** (iFood, 99Food, etc)
2. **Testar webhooks** em ambiente de desenvolvimento
3. **Configurar cron jobs** para polling
4. **Adicionar notificações** (WebSocket, Push)
5. **Criar dashboard** de monitoramento
6. **Documentar** para o cliente

---

**© 2024 - Documentação Técnica de Integrações**
