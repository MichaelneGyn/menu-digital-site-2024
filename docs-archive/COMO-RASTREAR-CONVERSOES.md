# 📊 COMO RASTREAR CONVERSÕES E COMPORTAMENTO DOS USUÁRIOS

## 🎯 OBJETIVO

Saber:
- ✅ Quantas pessoas visitam o site
- ✅ Quantas clicam nos botões de oferta
- ✅ Quantas chegam na página de cadastro
- ✅ Quantas completam o cadastro
- ✅ Onde as pessoas desistem

---

## 🔧 FERRAMENTAS NECESSÁRIAS

### 1. **Google Analytics 4 (GA4)** - GRÁTIS
- Rastreia visitantes
- Páginas visitadas
- Tempo no site
- Taxa de rejeição

### 2. **Google Tag Manager (GTM)** - GRÁTIS
- Rastreia cliques em botões
- Eventos personalizados
- Conversões

### 3. **Hotjar** - GRÁTIS (até 35 sessões/dia)
- Gravação de sessões (vídeo)
- Mapas de calor (onde clicam)
- Funis de conversão

---

## 📋 PASSO A PASSO: GOOGLE ANALYTICS 4

### Passo 1: Criar Conta GA4

1. Acesse: https://analytics.google.com/
2. Clique em "Começar a medir"
3. Nome da conta: "Virtual Cardápio"
4. Nome da propriedade: "Site Virtual Cardápio"
5. Selecione: Brasil, BRL, Fuso horário: Brasília
6. Categoria: "Tecnologia"
7. Clique em "Criar"

### Passo 2: Configurar Fluxo de Dados

1. Selecione: "Web"
2. URL do site: https://virtualcardapio.com.br
3. Nome do fluxo: "Site Principal"
4. Clique em "Criar fluxo"

### Passo 3: Copiar ID de Medição

```
Você receberá um ID assim:
G-XXXXXXXXXX

Exemplo: G-ABC123DEF4
```

### Passo 4: Adicionar ao Site

**Arquivo:** `app/layout.tsx`

```tsx
// Adicione no <head>
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  `}
</Script>
```

---

## 📊 EVENTOS IMPORTANTES PARA RASTREAR

### 1. **Clique em "Garantir 50% OFF"**
```tsx
onClick={() => {
  // Google Analytics
  gtag('event', 'click_oferta_black_friday', {
    event_category: 'Conversão',
    event_label: 'Botão Principal',
    value: 1
  });
  
  // Redireciona para cadastro
  window.location.href = '/auth/login?tab=register';
}}
```

### 2. **Clique em "Ver Como Funciona"**
```tsx
onClick={() => {
  gtag('event', 'click_ver_como_funciona', {
    event_category: 'Engajamento',
    event_label: 'Botão Secundário'
  });
}}
```

### 3. **Chegou na Página de Cadastro**
```tsx
// No componente de cadastro
useEffect(() => {
  gtag('event', 'page_view_cadastro', {
    event_category: 'Conversão',
    event_label: 'Página de Cadastro'
  });
}, []);
```

### 4. **Completou Cadastro**
```tsx
// Após criar conta com sucesso
gtag('event', 'cadastro_completo', {
  event_category: 'Conversão',
  event_label: 'Cadastro Finalizado',
  value: 1
});
```

---

## 🎯 FUNIL DE CONVERSÃO

### Configurar no GA4:

1. **Acesse:** Analytics → Explorar → Funil de exploração
2. **Configure as etapas:**

```
Etapa 1: Visitou Homepage
- Evento: page_view
- Página: /

Etapa 2: Clicou em Oferta
- Evento: click_oferta_black_friday

Etapa 3: Chegou no Cadastro
- Evento: page_view
- Página: /auth/login

Etapa 4: Completou Cadastro
- Evento: cadastro_completo
```

### Exemplo de Resultado:

```
100 visitantes → Homepage
 ↓ 30% clicaram
30 visitantes → Clicaram em Oferta
 ↓ 80% chegaram
24 visitantes → Página de Cadastro
 ↓ 25% completaram
6 visitantes → Cadastro Completo

Taxa de Conversão: 6%
```

---

## 🔥 HOTJAR - GRAVAÇÃO DE SESSÕES

### Passo 1: Criar Conta Hotjar

1. Acesse: https://www.hotjar.com/
2. Crie conta grátis
3. Adicione site: virtualcardapio.com.br

### Passo 2: Instalar Código

```html
<!-- Adicione no <head> -->
<script>
  (function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:YOUR_HOTJAR_ID,hjsv:6};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
  })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>
```

### Passo 3: Ver Gravações

1. Acesse: Hotjar → Recordings
2. Veja vídeos de usuários reais navegando
3. Identifique onde desistem

---

## 📊 MÉTRICAS PARA ACOMPANHAR

### Diariamente:
- ✅ Visitantes únicos
- ✅ Cliques em botões de oferta
- ✅ Taxa de conversão

### Semanalmente:
- ✅ Páginas mais visitadas
- ✅ Tempo médio no site
- ✅ Taxa de rejeição
- ✅ Dispositivos (mobile vs desktop)

### Mensalmente:
- ✅ Funil de conversão completo
- ✅ Origem do tráfego (Google, direto, redes sociais)
- ✅ Palavras-chave (Google Search Console)

---

## 🎯 METAS NO GA4

### Configurar Conversões:

1. **Acesse:** Admin → Eventos → Marcar como conversão
2. **Marque estes eventos:**
   - `cadastro_completo` ✅
   - `click_oferta_black_friday` ✅
   - `primeiro_login` ✅

---

## 📱 DASHBOARD SIMPLES

### Crie um Dashboard no GA4:

```
┌─────────────────────────────────────┐
│ HOJE                                │
├─────────────────────────────────────┤
│ 150 Visitantes                      │
│ 45 Cliques em Oferta (30%)          │
│ 36 Chegaram no Cadastro (80%)       │
│ 9 Completaram Cadastro (25%)        │
│                                     │
│ Taxa de Conversão: 6%               │
└─────────────────────────────────────┘
```

---

## 🚀 IMPLEMENTAÇÃO RÁPIDA

### Arquivo: `lib/analytics.ts`

```typescript
export const trackEvent = (eventName: string, params?: any) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  }
};

// Eventos específicos
export const Analytics = {
  clickOferta: () => {
    trackEvent('click_oferta_black_friday', {
      event_category: 'Conversão',
      event_label: 'Botão Principal'
    });
  },
  
  viewCadastro: () => {
    trackEvent('page_view_cadastro', {
      event_category: 'Conversão',
      event_label: 'Página de Cadastro'
    });
  },
  
  completeCadastro: () => {
    trackEvent('cadastro_completo', {
      event_category: 'Conversão',
      event_label: 'Cadastro Finalizado',
      value: 1
    });
  }
};
```

### Uso:

```tsx
import { Analytics } from '@/lib/analytics';

// No botão de oferta
<Button onClick={() => {
  Analytics.clickOferta();
  router.push('/auth/login?tab=register');
}}>
  🔥 GARANTIR 50% OFF AGORA!
</Button>
```

---

## 📊 RELATÓRIO SEMANAL

### Envie para seu email automaticamente:

1. **GA4:** Admin → Relatórios personalizados
2. **Configure:** Envio semanal por email
3. **Inclua:**
   - Visitantes
   - Conversões
   - Taxa de conversão
   - Páginas mais visitadas

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Criar conta Google Analytics 4
- [ ] Adicionar código GA4 no site
- [ ] Configurar eventos de clique
- [ ] Configurar funil de conversão
- [ ] Marcar eventos como conversões
- [ ] Criar conta Hotjar (opcional)
- [ ] Instalar código Hotjar
- [ ] Configurar relatórios automáticos
- [ ] Testar todos os eventos
- [ ] Acompanhar diariamente

---

## 🎯 RESULTADO ESPERADO

Após implementar, você saberá:

```
Exemplo de Dados Reais:

Dia 1:
- 200 visitantes
- 60 clicaram em oferta (30%)
- 48 chegaram no cadastro (80%)
- 12 completaram cadastro (25%)
- Taxa de conversão: 6%

Dia 2:
- 180 visitantes
- 54 clicaram em oferta (30%)
- 43 chegaram no cadastro (80%)
- 11 completaram cadastro (26%)
- Taxa de conversão: 6,1%

Insight: 20% desistem entre clicar e chegar no cadastro!
Ação: Melhorar velocidade da página de cadastro
```

---

## 💡 DICAS IMPORTANTES

1. **Não exagere nos eventos:** Rastreie apenas o essencial
2. **Teste antes de publicar:** Verifique se eventos funcionam
3. **Acompanhe semanalmente:** Não deixe acumular dados
4. **Aja nos insights:** Use dados para melhorar

---

## 🆘 SUPORTE

**Google Analytics:**
- https://support.google.com/analytics

**Hotjar:**
- https://help.hotjar.com/

**Comunidade:**
- https://www.reddit.com/r/analytics/

---

**Status:** ✅ PRONTO PARA IMPLEMENTAR

**Tempo de implementação:** 1-2 horas

**Resultado:** Dados completos de conversão! 📊
