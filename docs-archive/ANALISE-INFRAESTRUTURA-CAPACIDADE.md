# 📊 ANÁLISE DE INFRAESTRUTURA E CAPACIDADE

**Data:** 21/10/2025  
**Objetivo:** Determinar quantos clientes suportamos com infraestrutura FREE

---

## 🔧 STACK ATUAL

### **1. Banco de Dados: Supabase (FREE)**
```
Plano: Free
Banco: PostgreSQL
Limite DB: 500 MB
Bandwidth: 2 GB/mês
Connections: 60 simultâneas (pooling)
Realtime: Sim
Storage: 1 GB
```

### **2. Hosting: Vercel (Hobby - FREE)**
```
Plano: Hobby (FREE)
Build Minutes: 100 horas/mês
Bandwidth: 100 GB/mês
Serverless Functions: 1000 horas/mês
Edge Functions: Ilimitado
Requests: Ilimitados
```

### **3. Recursos Externos:**
- ✅ Next.js (gratuito)
- ✅ Prisma (gratuito)
- ✅ NextAuth (gratuito)
- ❌ Sem APIs pagas (WhatsApp, Google, SMS)

---

## 📐 CÁLCULO DE CAPACIDADE

### **CENÁRIO 1: Restaurante Pequeno**
```
- 50 pedidos/mês
- 50 itens no cardápio
- 500 pageviews/mês
- 5 mesas com QR Code
- 10 MB de imagens
```

**Consumo por restaurante/mês:**
- **Banco de dados:** ~2 MB
- **Bandwidth Supabase:** ~50 MB
- **Bandwidth Vercel:** ~500 MB
- **DB Connections:** ~5 simultâneas (pico)

### **CENÁRIO 2: Restaurante Médio**
```
- 300 pedidos/mês
- 100 itens no cardápio
- 2.000 pageviews/mês
- 20 mesas com QR Code
- 50 MB de imagens
```

**Consumo por restaurante/mês:**
- **Banco de dados:** ~10 MB
- **Bandwidth Supabase:** ~200 MB
- **Bandwidth Vercel:** ~2 GB
- **DB Connections:** ~10 simultâneas (pico)

### **CENÁRIO 3: Restaurante Grande**
```
- 1.000 pedidos/mês
- 200 itens no cardápio
- 10.000 pageviews/mês
- 50 mesas com QR Code
- 100 MB de imagens
```

**Consumo por restaurante/mês:**
- **Banco de dados:** ~30 MB
- **Bandwidth Supabase:** ~800 MB
- **Bandwidth Vercel:** ~10 GB
- **DB Connections:** ~20 simultâneas (pico)

---

## 🎯 CAPACIDADE MÁXIMA (FREE)

### **Limite por recurso:**

| Recurso | Limite FREE | Gargalo | Clientes Máx |
|---------|-------------|---------|--------------|
| **DB Size** | 500 MB | 2-10 MB/cliente | **50-250 clientes** |
| **Bandwidth Supabase** | 2 GB/mês | 50-200 MB/cliente | **10-40 clientes** |
| **Bandwidth Vercel** | 100 GB/mês | 500 MB-2 GB/cliente | **50-200 clientes** |
| **DB Connections** | 60 conexões | 5-10/cliente | **6-12 clientes** ⚠️ |

### **🚨 GARGALO PRINCIPAL: DB CONNECTIONS**

**O limite real é:** **10-15 clientes ativos simultaneamente**

---

## 💰 CUSTOS DE UPGRADE

### **Quando precisar escalar:**

#### **Supabase Pro ($25/mês):**
```
DB Size: 8 GB
Bandwidth: 50 GB/mês
Connections: 200 simultâneas
Storage: 100 GB
```
**Capacidade:** 100-150 clientes

#### **Vercel Pro ($20/mês):**
```
Build Minutes: 400h/mês
Bandwidth: 1 TB/mês
Tudo do Free +
Análises
```
**Capacidade:** Ilimitado para seu caso

#### **Custo Total (Upgrade):**
```
Supabase Pro: $25/mês (R$ 125)
Vercel Pro: $20/mês (R$ 100)
TOTAL: R$ 225/mês
```

---

## 📊 PROJEÇÃO DE RECEITA vs CUSTO

### **COM INFRAESTRUTURA FREE:**

| Clientes | Receita/mês | Custo | Lucro | Margem |
|----------|-------------|-------|-------|--------|
| 5 | R$ 449,50 | R$ 0 | R$ 449,50 | 100% |
| 10 | R$ 899,00 | R$ 0 | R$ 899,00 | 100% |
| 15 | R$ 1.348,50 | R$ 0 | R$ 1.348,50 | 100% ⚠️ |

⚠️ **Limite técnico atingido em 15 clientes**

### **COM INFRAESTRUTURA PAGA:**

| Clientes | Receita/mês | Custo | Lucro | Margem |
|----------|-------------|-------|-------|--------|
| 20 | R$ 1.798,00 | R$ 225 | R$ 1.573,00 | 87% |
| 50 | R$ 4.495,00 | R$ 225 | R$ 4.270,00 | 95% |
| 100 | R$ 8.990,00 | R$ 225 | R$ 8.765,00 | 97% |

---

## 🎯 ESTRATÉGIA RECOMENDADA

### **FASE 1: Primeiros 10 Clientes (FREE)**
```
Preço: R$ 49,90/mês (promoção fundadores)
Meta: Validar produto
Custo infra: R$ 0
Receita: R$ 499/mês
```

### **FASE 2: 10-15 Clientes (FREE - limite)**
```
Preço: R$ 69,90/mês (early adopters)
Meta: Chegar em 15 clientes
Custo infra: R$ 0
Receita: R$ 1.048,50/mês (média 15 clientes)
```

### **FASE 3: 16+ Clientes (PAGO)**
```
Preço: R$ 89,90/mês (preço normal)
Meta: Escalar
Custo infra: R$ 225/mês
Receita: R$ 1.438,40/mês (16 clientes)
Lucro: R$ 1.213,40/mês
```

---

## 🚀 PROPOSTA DE PRICING ESCALONADO

### **💎 PLANO ÚNICO COM PRICING PROGRESSIVO**

#### **🔥 Primeiros 10 Clientes: R$ 49,90/mês**
- Preço vitalício (não aumenta nunca)
- Badge "Cliente Fundador"
- Suporte prioritário
- Acesso antecipado a novos recursos

#### **⭐ Clientes 11-50: R$ 69,90/mês**
- Preço fixo vitalício
- Badge "Early Adopter"
- Todos os recursos

#### **✅ Cliente 51+: R$ 89,90/mês**
- Preço normal
- Todos os recursos

---

## 📈 SIMULAÇÃO DE CRESCIMENTO

### **Timeline de 12 meses:**

| Mês | Clientes | Preço Médio | Receita | Custo | Lucro | Margem |
|-----|----------|-------------|---------|-------|-------|--------|
| 1 | 3 | R$ 49,90 | R$ 149,70 | R$ 0 | R$ 149,70 | 100% |
| 2 | 7 | R$ 49,90 | R$ 349,30 | R$ 0 | R$ 349,30 | 100% |
| 3 | 10 | R$ 49,90 | R$ 499,00 | R$ 0 | R$ 499,00 | 100% |
| 4 | 15 | R$ 56,60 | R$ 849,00 | R$ 0 | R$ 849,00 | 100% |
| 5 | 20 | R$ 62,45 | R$ 1.249,00 | R$ 225 | R$ 1.024,00 | 82% |
| 6 | 30 | R$ 66,57 | R$ 1.997,10 | R$ 225 | R$ 1.772,10 | 89% |
| 12 | 100 | R$ 79,99 | R$ 7.999,00 | R$ 225 | R$ 7.774,00 | 97% |

### **Receita acumulada 12 meses:** ~R$ 45.000
### **Lucro acumulado 12 meses:** ~R$ 43.500

---

## ⚠️ RISCOS E MITIGAÇÕES

### **Risco 1: Limite de Conexões (60 no FREE)**
**Impacto:** Sistema fica lento com 15+ clientes  
**Mitigação:** 
- Implementar connection pooling otimizado
- Upgrade para Supabase Pro em 15 clientes
- Custo: R$ 125/mês (já incluído nas projeções)

### **Risco 2: Cliente Heavy User**
**Impacto:** 1 cliente consome recursos de 10  
**Mitigação:**
- Monitorar uso por cliente
- Implementar soft limits (avisos)
- Criar plano "Enterprise" para heavy users (R$ 199/mês)

### **Risco 3: Crescimento Muito Rápido**
**Impacto:** Atingir limite antes do previsto  
**Mitigação:**
- Ter cartão preparado para upgrade imediato
- ROI positivo em 3 clientes pagantes

---

## 🎯 RECOMENDAÇÃO FINAL

### **✅ PRICING ESTRATÉGICO:**

```
Primeiros 10: R$ 49,90/mês VITALÍCIO
Clientes 11-50: R$ 69,90/mês VITALÍCIO  
Cliente 51+: R$ 89,90/mês
```

### **✅ POR QUÊ FUNCIONA:**

1. **Validação barata:** R$ 49,90 remove fricção inicial
2. **Previsibilidade:** Cliente sabe que preço não sobe
3. **Urgência:** "Primeiros 10" cria FOMO
4. **Sustentável:** Mesmo R$ 49,90 tem 100% margem no FREE
5. **Escalável:** Upgrade de infra paga-se sozinho em 3 clientes

### **✅ BREAKEVEN:**

- **Infra FREE:** Lucro desde cliente #1
- **Infra PAGA (R$ 225/mês):** Breakeven em 3 clientes
- **Margem:** 82-97% após upgrade

---

## 🚦 SINAIS PARA UPGRADE

### **Upgrade para Supabase Pro quando:**
- ✅ 15 clientes ativos
- ✅ 400 MB de DB usados
- ✅ Conexões rejeitadas no log
- ✅ Receita > R$ 1.000/mês

### **Upgrade para Vercel Pro quando:**
- ✅ 80 GB bandwidth/mês usado
- ✅ Build minutes > 90h/mês
- ✅ Precisa de analytics avançado

---

## 📞 PRÓXIMOS PASSOS

1. ✅ Implementar pricing progressivo na landing
2. ✅ Criar badge "Cliente Fundador" no sistema
3. ✅ Monitoramento de uso (dashboard admin)
4. ✅ Script de alerta de capacidade
5. ✅ Documentar processo de upgrade

---

**Conclusão:** Com FREE, você suporta **10-15 clientes confortavelmente**.  
**Upgrade:** Necessário a partir de 15 clientes, mas já terá receita para cobrir (R$ 1.048,50/mês).

**ROI do upgrade:** Positivo desde o primeiro mês pago (R$ 225 custo vs R$ 1.438+ receita).
