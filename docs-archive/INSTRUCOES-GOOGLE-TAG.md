# ✅ Google Tag Manager - Configuração Completa

## 🎯 Status Atual

O Google Tag Manager **JÁ ESTÁ INSTALADO** no site virtualcardapio.com.br!

### 📍 Onde está instalado:

1. **Componente:** `components/GoogleTagManager.tsx`
2. **ID da Tag:** `AW-11137844448`
3. **Localização:** Inserido no `<head>` de todas as páginas via `app/layout.tsx`

---

## 🔍 Como Verificar se Está Funcionando

### Opção 1: Google Tag Assistant (Recomendado)

1. Instale a extensão: [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. Acesse: https://virtualcardapio.com.br
3. Clique no ícone da extensão
4. Verifique se aparece: **Google Ads (AW-11137844448)** ✅

### Opção 2: Inspecionar Código Fonte

1. Acesse: https://virtualcardapio.com.br
2. Pressione `Ctrl + U` (ver código fonte)
3. Procure por: `AW-11137844448`
4. Deve aparecer o script do Google Tag Manager

### Opção 3: Console do Navegador

1. Acesse: https://virtualcardapio.com.br
2. Pressione `F12` (abrir DevTools)
3. Vá na aba **Console**
4. Digite: `dataLayer`
5. Deve retornar um array com dados

---

## 🚀 Como Fazer Deploy das Mudanças

### Se estiver usando Vercel:

```bash
# 1. Commit das mudanças
git add .
git commit -m "feat: atualizar Google Tag Manager"

# 2. Push para o repositório
git push origin main

# 3. Deploy automático (Vercel detecta e faz deploy)
```

### Se estiver usando outro serviço:

```bash
# 1. Build do projeto
npm run build

# 2. Deploy conforme seu serviço
# (Netlify, AWS, etc)
```

---

## 📊 Verificar no Google Ads

### Opção 1: Via Diagnóstico de Campanha

1. Acesse: [Google Ads](https://ads.google.com)
2. Clique no **ícone de ferramentas** (🔧) no canto superior direito
3. Em **Planejamento**, clique em: **Diagnóstico da campanha**
4. Ou acesse direto: https://ads.google.com/aw/campaigns/diagnostics
5. Verifique se a tag está detectada

### Opção 2: Via Tag do Google

1. Acesse: [Google Tag Manager](https://tagmanager.google.com)
2. Ou vá em: **Ferramentas** > **Configuração** > **Tag do Google**
3. Digite: `virtualcardapio.com.br`
4. Deve aparecer: **Tag detectada** ✅

### Opção 3: Verificar Diretamente no Site

1. Acesse: https://virtualcardapio.com.br
2. Clique com botão direito > **Inspecionar** (ou F12)
3. Vá na aba **Network** (Rede)
4. Recarregue a página (F5)
5. Procure por: `gtag/js?id=AW-11137844448`
6. Se aparecer, está funcionando! ✅

---

## ⚠️ Tempo de Propagação

- **Após o deploy:** Aguarde 5-10 minutos
- **Verificação do Google:** Pode levar até 24 horas para o Google confirmar
- **Status "Limitada":** Normal nas primeiras 24-48 horas

---

## 🔧 Troubleshooting

### Tag não aparece no site:

1. Limpe o cache do navegador (`Ctrl + Shift + Delete`)
2. Acesse em modo anônimo (`Ctrl + Shift + N`)
3. Verifique se o deploy foi feito corretamente

### Google Ads não detecta:

1. Aguarde 24 horas
2. Verifique se o site está acessível publicamente
3. Teste com a ferramenta: [Google Tag Assistant](https://tagassistant.google.com/)

---

## 📝 Código Instalado

O seguinte código está ativo em **TODAS as páginas** do site:

```html
<!-- Google Tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-11137844448"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-11137844448');
</script>
```

---

## ✅ Checklist Final

- [x] Google Tag Manager instalado
- [x] ID correto: AW-11137844448
- [x] Código no `<head>` de todas as páginas
- [ ] Deploy feito para produção
- [ ] Verificado com Google Tag Assistant
- [ ] Confirmado no Google Ads

---

## 🎉 Próximos Passos

1. **Faça o deploy** das mudanças
2. **Aguarde 10 minutos**
3. **Teste** com Google Tag Assistant
4. **Verifique** no Google Ads após 24h
5. **Configure conversões** (cadastros, vendas, etc)

---

## 📞 Suporte

Se precisar de ajuda, verifique:
- [Documentação Google Tag Manager](https://developers.google.com/tag-platform/gtagjs)
- [Suporte Google Ads](https://support.google.com/google-ads)
