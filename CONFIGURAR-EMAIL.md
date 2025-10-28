# 📧 CONFIGURAÇÃO DE EMAIL - GUIA COMPLETO

## ✅ **O QUE JÁ FOI FEITO:**

1. ✅ Email corrigido: **vituralcardapio@gmail.com**
2. ✅ API Resend configurada localmente
3. ✅ Formulário de contato funcionando
4. ✅ Template HTML profissional criado

---

## 🔴 **PASSOS OBRIGATÓRIOS (3 minutos):**

### **1. Configurar RESEND_API_KEY na Vercel**

A API key está configurada **APENAS localmente**. Para funcionar em produção:

**Passos:**

1. Acesse: https://vercel.com/seu-projeto/settings/environment-variables

2. Adicione nova variável:
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_T4xS1fZS_Sb5BFYeXMj9EtcABeqMYCp24`
   - **Environment:** `Production`, `Preview`, `Development` (marque todos)

3. Clique em **Save**

4. **Redeploy** o projeto (necessário para aplicar a variável):
   - Vá em: Deployments
   - Clique nos 3 pontinhos do último deploy
   - Clique em **Redeploy**

---

### **2. Fazer Deploy das Alterações**

```bash
cd "C:\Users\Administrator\Desktop\MENU DIGITAL\menu-digital-site-2024-8773d37d606448f665f364adadb0de35da0262ad"

# Commit da correção de email
git add .
git commit -m "✉️ Correção: Email de contato para vituralcardapio@gmail.com"
git push origin main

# Vercel fará deploy automaticamente
```

---

### **3. Configurar Gmail para Receber Emails do Resend**

**⚠️ IMPORTANTE:** O Resend envia emails de `onboarding@resend.dev`

Para garantir que chegue na caixa de entrada:

**Opção A: Adicionar aos Contatos**
1. Abra o Gmail: https://mail.google.com/
2. Novo email → Para: `onboarding@resend.dev`
3. Adicionar aos contatos
4. Salvar

**Opção B: Criar Filtro**
1. Gmail → Configurações (⚙️) → Ver todas as configurações
2. Filtros e endereços bloqueados
3. Criar novo filtro
4. De: `onboarding@resend.dev`
5. Criar filtro → Marcar:
   - ✅ Nunca enviar para spam
   - ✅ Sempre marcar como importante
   - ✅ Categorizar como: Principal
6. Criar filtro

---

## 🧪 **TESTAR O FORMULÁRIO**

### **Após fazer deploy:**

1. **Acesse:** https://virtualcardapio.com.br

2. **Role até:** Seção "Ficou com dúvida?" (final da página)

3. **Preencha o formulário:**
   - Nome do Restaurante: `Teste Pizza`
   - Seu Nome: `João Teste`
   - WhatsApp: `(62) 98110-5064`
   - Email: `teste@gmail.com`
   - Mensagem: `Teste de contato`

4. **Clique:** 📧 Enviar Mensagem

5. **Verificar:**
   - ✅ Mensagem "Enviado com sucesso" aparece?
   - ✅ Email chegou em **vituralcardapio@gmail.com**?
   - ✅ Email está bonito e completo?

---

## 📬 **COMO SERÁ O EMAIL QUE VOCÊ VAI RECEBER:**

```
De: Virtual Cardápio <onboarding@resend.dev>
Para: vituralcardapio@gmail.com
Responder para: teste@gmail.com (email do cliente)
Assunto: 🔔 Novo Contato: Teste Pizza

┌─────────────────────────────────────┐
│  🔔 Novo Contato Recebido!          │
│  MenuRapido - Sistema de Gestão     │
└─────────────────────────────────────┘

Olá! Você recebeu um novo contato através do site.

┌─────────────────────────────────────┐
│ 🏪 Restaurante: Teste Pizza         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 👤 Nome: João Teste                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📱 WhatsApp: (62) 98110-5064        │
│    [Clique aqui para conversar]     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📧 Email: teste@gmail.com           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 💬 Mensagem:                        │
│ Teste de contato                    │
└─────────────────────────────────────┘

💡 Dica: Responda este email diretamente 
ou clique no WhatsApp acima!
```

---

## 🔍 **VERIFICAR SE FUNCIONOU:**

### **Opção 1: Verificar no Gmail**
- Acesse: https://mail.google.com/
- Procure por: "Novo Contato"
- Email de: `onboarding@resend.dev`

### **Opção 2: Verificar nos Logs da Vercel**
1. Acesse: https://vercel.com/seu-projeto/logs
2. Procure por: `✅ Email enviado com sucesso`
3. Se aparecer: **FUNCIONOU!** ✅
4. Se aparecer erro: Veja a seção de troubleshooting

---

## 🚨 **TROUBLESHOOTING**

### **Problema 1: Email não chega**

**Verificar:**
```
1. API Key está na Vercel? ✓
2. Redeploy foi feito? ✓
3. Filtro de spam? Checar pasta SPAM
4. Email correto? vituralcardapio@gmail.com ✓
```

**Solução:**
- Checar pasta **SPAM** do Gmail
- Adicionar `onboarding@resend.dev` aos contatos
- Verificar logs da Vercel

### **Problema 2: Erro no formulário**

**No navegador (F12 → Console):**
```javascript
// Se aparecer erro 500:
// Verificar se RESEND_API_KEY está na Vercel
```

**Nos logs da Vercel:**
```
❌ Erro ao enviar email: [detalhes]
// Copie o erro e me envie
```

### **Problema 3: Email vai para SPAM**

**Soluções:**
1. Adicionar aos contatos (método acima)
2. Marcar como "Não é spam"
3. Criar filtro (método acima)

---

## 💰 **LIMITES DO RESEND (Plano Grátis)**

```
✅ 100 emails/dia
✅ 3.000 emails/mês
✅ Domínio compartilhado (onboarding@resend.dev)

Para seu negócio:
- 10 clientes
- ~30 contatos/mês esperado
- MUITO abaixo do limite ✅
```

---

## 🎯 **UPGRADE FUTURO (Opcional)**

**Se quiser enviar de domínio próprio:**

**Custo:** $20/mês (50.000 emails)

**Benefício:**
- Email de: `contato@virtualcardapio.com.br`
- Mais profissional
- Não vai para spam

**Como fazer:**
1. Comprar domínio
2. Configurar DNS no Resend
3. Atualizar `from` no código

**Por enquanto:** Plano grátis é SUFICIENTE! ✅

---

## ✅ **CHECKLIST FINAL**

Marque conforme for completando:

- [ ] 1. RESEND_API_KEY configurada na Vercel
- [ ] 2. Redeploy feito
- [ ] 3. Deploy das alterações (git push)
- [ ] 4. Gmail configurado para receber
- [ ] 5. Teste enviado no site
- [ ] 6. Email recebido em vituralcardapio@gmail.com
- [ ] 7. ✅ TUDO FUNCIONANDO!

---

## 📞 **RESUMO RÁPIDO**

```bash
# 1. Adicionar variável na Vercel:
RESEND_API_KEY = re_T4xS1fZS_Sb5BFYeXMj9EtcABeqMYCp24

# 2. Fazer deploy:
git add .
git commit -m "✉️ Email corrigido"
git push

# 3. Testar:
Ir em virtualcardapio.com.br → Formulário → Enviar

# 4. Verificar:
Abrir Gmail → Procurar "Novo Contato"
```

**Tempo estimado:** 3 minutos  
**Dificuldade:** ⭐ Fácil

---

**🎉 Após isso, todos os contatos vão chegar em vituralcardapio@gmail.com automaticamente!**
