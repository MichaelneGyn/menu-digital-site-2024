# 📱 GUIA COMPLETO: INTEGRAÇÕES DE DELIVERY

## 🎯 O QUE SÃO AS INTEGRAÇÕES?

As integrações permitem que você **receba pedidos de todas as plataformas de delivery em um único lugar** - o seu painel administrativo.

### ✅ **Antes das Integrações:**
```
iFood App → Você abre o app do iFood
99Food App → Você abre o app do 99Food
Rappi App → Você abre o app do Rappi
Seu Site → Você abre seu painel
```
**Problema**: 4 apps diferentes, 4 notificações, muito trabalho!

### ✅ **Depois das Integrações:**
```
iFood → 
99Food →  → SEU PAINEL ÚNICO → Todos os pedidos juntos!
Rappi →
Seu Site →
```
**Solução**: Um único painel, uma única notificação, tudo organizado!

---

## 🚀 PLATAFORMAS DISPONÍVEIS

### 1. **iFood** 🍔
- Maior plataforma do Brasil
- Mais pedidos
- Comissão: ~27%

### 2. **99Food** 🚗
- Taxas reduzidas
- Promoção: 0% no primeiro ano
- Crescimento rápido

### 3. **Rappi** 🛵
- Delivery rápido
- Forte em grandes cidades
- Comissão: ~25%

### 4. **Uber Eats** 🚙
- Marca global
- Público diferenciado
- Comissão: ~30%

### 5. **aiqfome** 🍕
- Forte no interior
- Regional
- Comissão: ~20%

---

## 📋 PASSO A PASSO: COMO CONFIGURAR

### **ETAPA 1: ACESSAR O PAINEL**

1. Faça login no seu painel administrativo
2. No menu lateral, clique em **"Integrações"**
3. Você verá todas as plataformas disponíveis

---

### **ETAPA 2: ESCOLHER A PLATAFORMA**

1. Clique no card da plataforma que deseja integrar
2. Exemplo: **iFood**
3. Clique em **"Configurar Integração"**

---

### **ETAPA 3: OBTER AS CREDENCIAIS**

#### **Para iFood:**

1. Acesse: https://developer.ifood.com.br
2. Faça login com sua conta do iFood
3. Vá em **"Meus Apps"**
4. Clique em **"Criar Novo App"**
5. Preencha:
   - Nome: "Meu Restaurante - Integração"
   - Tipo: "Merchant"
6. Copie:
   - **Client ID** (exemplo: `abc123xyz`)
   - **Client Secret** (exemplo: `secret456def`)
   - **Store ID** (ID da sua loja no iFood)

#### **Para 99Food:**

1. Acesse: https://merchant.99app.com
2. Faça login
3. Vá em **"Configurações" → "API"**
4. Clique em **"Gerar API Key"**
5. Copie:
   - **API Key** (exemplo: `99food_key_789`)
   - **Merchant ID** (seu ID de lojista)

#### **Para Rappi:**

1. Entre em contato com o suporte Rappi
2. Solicite acesso à API
3. Eles fornecerão:
   - **Client ID**
   - **Client Secret**
   - **Store ID**

#### **Para Uber Eats:**

1. Acesse: https://developer.uber.com
2. Crie uma conta de desenvolvedor
3. Crie um novo app
4. Copie as credenciais

#### **Para aiqfome:**

1. Entre em contato com o suporte
2. Solicite API Key
3. Copie as credenciais

---

### **ETAPA 4: CONFIGURAR NO PAINEL**

1. Cole as credenciais nos campos correspondentes:
   - **Client ID**: Cole aqui
   - **Client Secret**: Cole aqui
   - **Store ID**: Cole aqui

2. Configure as opções:
   - ✅ **Aceitar pedidos automaticamente**: 
     - Ligado = Pedidos são aceitos sem você confirmar
     - Desligado = Você precisa aceitar manualmente
   
   - ✅ **Sincronizar cardápio automaticamente**:
     - Ligado = Alterações no cardápio vão para a plataforma
     - Desligado = Você gerencia o cardápio separadamente

3. Clique em **"Salvar Integração"**

---

### **ETAPA 5: ATIVAR A INTEGRAÇÃO**

1. Após salvar, você verá a integração na lista
2. Status: **"Pendente"** (amarelo)
3. Clique no botão **"Ativar"** (switch)
4. O sistema fará um teste de conexão
5. Se tudo OK, status muda para **"Sincronizado"** (verde)

---

## 🎯 COMO USAR NO DIA A DIA

### **📱 RECEBENDO PEDIDOS**

#### **Antes (sem integração):**
```
1. Cliente faz pedido no iFood
2. Você recebe notificação no app do iFood
3. Você abre o app do iFood
4. Você aceita o pedido
5. Você anota em algum lugar
6. Você prepara
```

#### **Agora (com integração):**
```
1. Cliente faz pedido no iFood
2. Pedido aparece AUTOMATICAMENTE no seu painel
3. Você vê junto com todos os outros pedidos
4. Você aceita (ou é aceito automaticamente)
5. Você prepara
6. Status sincroniza com o iFood
```

---

### **🔔 NOTIFICAÇÕES**

Você receberá **UMA ÚNICA NOTIFICAÇÃO** para todos os pedidos:
- Som de notificação
- Badge com número de pedidos
- Todos os pedidos em uma lista unificada

---

### **📊 DASHBOARD UNIFICADO**

```
┌─────────────────────────────────────────────┐
│         PEDIDOS - TODAS AS PLATAFORMAS      │
├─────────────────────────────────────────────┤
│ 🟢 #1234 - iFood                            │
│    Pizza Margherita - R$ 45,00              │
│    Status: Preparando                       │
│    [Atualizar Status] [Ver Detalhes]       │
├─────────────────────────────────────────────┤
│ 🟡 #5678 - 99Food                           │
│    Hambúrguer - R$ 32,00                    │
│    Status: Aguardando Confirmação          │
│    [Aceitar] [Recusar]                     │
├─────────────────────────────────────────────┤
│ 🟢 #9012 - Seu Site                         │
│    Refrigerante - R$ 8,00                   │
│    Status: Entregue                        │
│    [Ver Detalhes]                          │
└─────────────────────────────────────────────┘
```

---

### **🔄 ATUALIZANDO STATUS**

Quando você atualiza o status no painel:
1. Clique no pedido
2. Selecione o novo status:
   - ✅ **Confirmado** → Cliente é notificado
   - 🍳 **Preparando** → Cliente vê que está sendo feito
   - 📦 **Pronto** → Cliente sabe que pode buscar/sair para entrega
   - 🚚 **Saiu para entrega** → Cliente acompanha
   - ✅ **Entregue** → Pedido finalizado

3. O status é **automaticamente sincronizado** com a plataforma (iFood, 99Food, etc)
4. O cliente vê a atualização no app dele

---

### **📋 SINCRONIZAÇÃO DE CARDÁPIO**

#### **Se ativado:**
- Você atualiza o preço de uma pizza no seu painel
- O preço é **automaticamente atualizado** no iFood, 99Food, etc
- Você desativa um produto
- Ele é **desativado em todas as plataformas**

#### **Se desativado:**
- Você gerencia cada cardápio separadamente
- Útil se você tem preços diferentes em cada plataforma

---

## ⚙️ CONFIGURAÇÕES AVANÇADAS

### **🤖 Aceitar Pedidos Automaticamente**

#### **Ligado (Recomendado para alto volume):**
- ✅ Pedidos são aceitos instantaneamente
- ✅ Cliente não espera
- ✅ Menos trabalho para você
- ⚠️ Você precisa estar preparado para atender

#### **Desligado (Recomendado para começar):**
- ✅ Você confirma cada pedido
- ✅ Pode recusar se necessário
- ✅ Mais controle
- ⚠️ Cliente espera confirmação

---

### **🔄 Intervalo de Sincronização**

- **Padrão**: 15 minutos
- **Mínimo**: 5 minutos
- **Máximo**: 60 minutos

Quanto menor o intervalo:
- ✅ Mais atualizado
- ⚠️ Mais requisições à API

---

### **📊 Logs e Monitoramento**

Você pode ver:
- ✅ Todos os pedidos recebidos
- ✅ Erros de sincronização
- ✅ Histórico de atualizações
- ✅ Tempo de resposta

---

## 🚨 RESOLUÇÃO DE PROBLEMAS

### **❌ Status: "Erro"**

**Possíveis causas:**
1. Credenciais incorretas
2. Token expirado
3. Loja desativada na plataforma
4. Problema de conexão

**Solução:**
1. Clique em **"Configurar"**
2. Verifique as credenciais
3. Clique em **"Sincronizar Agora"**
4. Se persistir, entre em contato com o suporte

---

### **⚠️ Pedidos não aparecem**

**Verificar:**
1. Integração está **ativa**? (switch ligado)
2. Status está **"Sincronizado"**?
3. Credenciais estão corretas?
4. Loja está aberta na plataforma?

**Solução:**
1. Clique em **"Sincronizar Agora"**
2. Verifique os logs
3. Teste fazendo um pedido de teste

---

### **🔄 Sincronização lenta**

**Causas:**
- Muitos produtos
- Muitas plataformas
- Conexão lenta

**Solução:**
- Aumente o intervalo de sincronização
- Sincronize apenas quando necessário
- Entre em contato com suporte

---

## 💰 CUSTOS E TAXAS

### **💵 Custo da Integração:**
- ✅ **R$ 30/mês por plataforma** (adicional à mensalidade)
- ✅ Ou **R$ 100/mês** para todas as 5 plataformas (desconto)

### **💵 Taxas das Plataformas:**
As plataformas continuam cobrando suas comissões normais:
- iFood: ~27%
- 99Food: 0% (primeiro ano) depois ~27%
- Rappi: ~25%
- Uber Eats: ~30%
- aiqfome: ~20%

**Importante**: A integração não muda as taxas das plataformas!

---

## 📊 RELATÓRIOS UNIFICADOS

Com as integrações ativas, você terá:

### **📈 Vendas por Plataforma**
```
iFood:     R$ 5.000 (50%)
99Food:    R$ 3.000 (30%)
Seu Site:  R$ 2.000 (20%)
TOTAL:     R$ 10.000
```

### **📊 Produtos Mais Vendidos**
```
1. Pizza Margherita - 50 vendas
   - iFood: 30
   - 99Food: 15
   - Seu Site: 5

2. Hambúrguer - 40 vendas
   - iFood: 20
   - 99Food: 15
   - Seu Site: 5
```

### **💰 Lucro por Plataforma**
```
iFood:     R$ 3.650 (após comissão de 27%)
99Food:    R$ 3.000 (sem comissão - promo)
Seu Site:  R$ 2.000 (sem comissão)
TOTAL:     R$ 8.650
```

---

## 🎯 MELHORES PRÁTICAS

### **✅ Recomendações:**

1. **Comece com 1-2 plataformas**
   - Teste primeiro
   - Depois adicione mais

2. **Ative "Aceitar Automaticamente" depois de testar**
   - Comece manual
   - Depois automatize

3. **Sincronize o cardápio**
   - Mantenha tudo atualizado
   - Evite pedidos de produtos indisponíveis

4. **Monitore os logs**
   - Verifique erros
   - Corrija problemas rapidamente

5. **Mantenha as credenciais seguras**
   - Não compartilhe
   - Troque periodicamente

---

## 📞 SUPORTE

### **🆘 Precisa de Ajuda?**

1. **WhatsApp**: [Seu número]
2. **Email**: suporte@seusite.com
3. **Chat**: Dentro do painel

### **📚 Recursos:**
- Vídeos tutoriais
- FAQ completo
- Documentação técnica

---

## 🎓 VÍDEO TUTORIAL

**Em breve**: Vídeo passo a passo mostrando:
1. Como configurar cada plataforma
2. Como receber o primeiro pedido
3. Como gerenciar múltiplas plataformas
4. Dicas e truques

---

## ✅ CHECKLIST DE CONFIGURAÇÃO

### **Antes de começar:**
- [ ] Tenho conta ativa no iFood/99Food/etc
- [ ] Tenho CNPJ cadastrado
- [ ] Tenho acesso ao painel da plataforma
- [ ] Tenho permissão para criar apps/API

### **Durante a configuração:**
- [ ] Acessei o portal de desenvolvedores
- [ ] Criei um app/obtive API key
- [ ] Copiei todas as credenciais
- [ ] Colei no painel
- [ ] Configurei as opções
- [ ] Salvei a integração

### **Após configurar:**
- [ ] Ativei a integração
- [ ] Status está "Sincronizado"
- [ ] Fiz um pedido de teste
- [ ] Pedido apareceu no painel
- [ ] Consegui atualizar o status
- [ ] Status sincronizou com a plataforma

---

## 🎉 PRONTO!

Agora você está recebendo pedidos de todas as plataformas em um único lugar!

### **Benefícios:**
- ✅ Menos apps para gerenciar
- ✅ Uma única notificação
- ✅ Relatórios unificados
- ✅ Mais eficiência
- ✅ Menos erros
- ✅ Mais tempo para focar no que importa

---

**© 2024 - Guia de Integrações de Delivery**
