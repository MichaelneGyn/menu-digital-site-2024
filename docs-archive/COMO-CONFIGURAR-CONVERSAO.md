# 🎯 Como Configurar Conversões no Google Ads

## ✅ Status Atual

A **Tag do Google está funcionando!** 🎉

O Google Tag Assistant detectou a tag no site virtualcardapio.com.br.

A mensagem "Nenhuma tag foi avaliada neste contêiner" é **NORMAL** porque ainda não há conversões configuradas.

---

## 📊 Como Criar uma Conversão

### Passo 1: Acessar Conversões

1. Acesse: [Google Ads](https://ads.google.com)
2. Clique no **ícone de ferramentas** 🔧 (canto superior direito)
3. Em **Medição**, clique em: **Conversões**
4. Ou acesse direto: https://ads.google.com/aw/conversions

### Passo 2: Criar Nova Conversão

1. Clique em: **+ Nova ação de conversão**
2. Selecione: **Site**
3. Escolha o tipo:
   - **Cadastro** (para quando alguém criar conta)
   - **Compra** (para quando alguém assinar)
   - **Visualização de página** (para páginas importantes)

### Passo 3: Configurar a Conversão

#### Para Cadastro/Teste Grátis:

```
Nome: Cadastro - Teste Grátis
Categoria: Cadastro
Valor: 50 (valor estimado de um lead)
Contagem: Uma (contar apenas uma vez por pessoa)
Janela de conversão: 30 dias
```

#### Para Assinatura/Pagamento:

```
Nome: Assinatura - Plano Completo
Categoria: Compra
Valor: 69.90 (valor da mensalidade)
Contagem: Todas (contar toda vez que pagar)
Janela de conversão: 90 dias
```

### Passo 4: Escolher Como Rastrear

1. Selecione: **Usar a tag do Google**
2. Escolha: **Evento**
3. Nome do evento: `cadastro_teste_gratis` ou `assinatura_completa`

---

## 🔧 Implementar Rastreamento de Conversão

### Opção 1: Rastreamento Automático (Recomendado)

Vou criar um componente para rastrear automaticamente:

#### 1. Rastrear Cadastros

Quando alguém criar conta, dispare:

```typescript
// No arquivo de cadastro/login
gtag('event', 'conversion', {
  'send_to': 'AW-11137844448/CONVERSION_ID',
  'value': 50.0,
  'currency': 'BRL'
});
```

#### 2. Rastrear Assinaturas

Quando alguém assinar, dispare:

```typescript
// No arquivo de pagamento/checkout
gtag('event', 'conversion', {
  'send_to': 'AW-11137844448/CONVERSION_ID',
  'value': 69.90,
  'currency': 'BRL',
  'transaction_id': 'ORDER_ID_AQUI'
});
```

### Opção 2: Rastreamento por URL (Mais Simples)

Configure para disparar quando o usuário acessar:

- **Cadastro:** `/auth/login?success=true`
- **Assinatura:** `/checkout/success`
- **Dashboard:** `/admin/dashboard` (primeira vez)

---

## 🎯 Conversões Recomendadas para Seu Site

### 1. **Teste Grátis Iniciado** (Prioridade Alta)
- **Quando:** Usuário cria conta
- **Valor:** R$ 50
- **URL:** `/auth/login` ou `/admin/dashboard`

### 2. **Assinatura Completa** (Prioridade Alta)
- **Quando:** Usuário assina o plano
- **Valor:** R$ 69,90
- **URL:** `/checkout/success` ou `/payment/confirmed`

### 3. **Visualização de Preços** (Prioridade Média)
- **Quando:** Usuário rola até a seção de preços
- **Valor:** R$ 0
- **Evento:** Scroll até #planos

### 4. **Clique no WhatsApp** (Prioridade Baixa)
- **Quando:** Usuário clica no botão do WhatsApp
- **Valor:** R$ 0
- **Evento:** Click no botão

---

## 📝 Exemplo Prático: Rastrear Cadastro

### 1. Criar o Evento no Google Ads

1. Vá em: **Conversões** > **+ Nova ação**
2. Tipo: **Site**
3. Categoria: **Cadastro**
4. Nome: `Teste Grátis Iniciado`
5. Método: **Evento**
6. Nome do evento: `signup`

### 2. Copiar o ID da Conversão

Após criar, você verá algo como:
```
AW-11137844448/AbC123dEfG
```

Copie esse ID!

### 3. Adicionar no Código

Crie um arquivo: `lib/gtm-events.ts`

```typescript
export const GTMEvents = {
  // Quando usuário criar conta
  trackSignup: () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-11137844448/AbC123dEfG', // Substitua pelo seu ID
        'value': 50.0,
        'currency': 'BRL'
      });
    }
  },

  // Quando usuário assinar
  trackSubscription: (value: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-11137844448/XyZ789hIjK', // Substitua pelo seu ID
        'value': value,
        'currency': 'BRL'
      });
    }
  }
};
```

### 4. Usar no Código

```typescript
// No arquivo de cadastro (após criar conta)
import { GTMEvents } from '@/lib/gtm-events';

// Após sucesso no cadastro
GTMEvents.trackSignup();
```

---

## 🧪 Testar a Conversão

### 1. Modo de Teste

1. No Google Ads, vá em: **Conversões**
2. Clique na conversão criada
3. Ative: **Modo de teste**

### 2. Fazer um Teste

1. Acesse o site em modo anônimo
2. Faça o cadastro/ação
3. Verifique no Google Ads se apareceu

### 3. Verificar no Tag Assistant

1. Instale: [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. Ative a extensão
3. Faça a ação (cadastro/compra)
4. Verifique se o evento disparou

---

## ⚠️ Importante

### Tempo de Processamento

- **Tag detectada:** Imediato
- **Conversão aparecer:** 3-24 horas
- **Dados completos:** 24-48 horas

### Status "Não verificada"

É normal nas primeiras 24-48 horas. Aguarde!

### Conversões de Teste

Não contam para estatísticas reais. Desative o modo de teste quando estiver funcionando.

---

## 📊 Próximos Passos

1. ✅ Tag instalada (FEITO!)
2. ⏳ Criar conversão no Google Ads
3. ⏳ Adicionar código de rastreamento
4. ⏳ Testar conversão
5. ⏳ Ativar campanhas

---

## 🎉 Resumo

**Situação Atual:**
- ✅ Tag do Google: **FUNCIONANDO**
- ⏳ Conversões: **PENDENTE** (precisa configurar)

**Próximo Passo:**
1. Criar conversão no Google Ads
2. Copiar o ID da conversão
3. Adicionar no código (posso ajudar!)

---

## 📞 Precisa de Ajuda?

Me avise qual conversão quer rastrear primeiro:
- [ ] Cadastro/Teste Grátis
- [ ] Assinatura/Pagamento
- [ ] Visualização de Página
- [ ] Clique em Botão

Vou criar o código completo para você! 🚀
