# 🔧 TROUBLESHOOTING - EMAIL NÃO CHEGA

## ❌ PROBLEMA: Cadastro criado mas email não chega

---

## ✅ CHECKLIST DE VERIFICAÇÃO:

### **1. Verificar se a API Key está na Vercel**

1. Acesse: https://vercel.com
2. Selecione o projeto
3. Vá em **Settings → Environment Variables**
4. Procure por: `RESEND_API_KEY`
5. Deve estar lá com o valor: `re_tQiwTekM_5GMqL0La46tW4A05mxQvu7V`

**Se NÃO estiver:**
- Adicione agora
- Marque: Production, Preview, Development
- Faça redeploy

---

### **2. Verificar se fez redeploy após adicionar**

Depois de adicionar a variável, você PRECISA fazer redeploy:

**Opção 1: Git**
```bash
git add .
git commit -m "fix: adicionar logs de email"
git push origin main
```

**Opção 2: Vercel Dashboard**
1. Deployments
2. Três pontinhos no último deploy
3. Redeploy

---

### **3. Verificar logs da Vercel**

1. Acesse: https://vercel.com
2. Vá em **Deployments**
3. Clique no último deployment
4. Clique em **"View Function Logs"**
5. Procure por:
   - `📧 Tentando enviar email...`
   - `✅ Email enviado!`
   - `❌ Erro ao enviar email`

---

### **4. Verificar se o código está sendo chamado**

Nos logs da Vercel, você deve ver:

```
📧 Tentando enviar email de novo cadastro...
Para: michaeldouglasqueiroz@gmail.com
De: onboarding@resend.dev
API Key existe? true
✅ Email de novo cadastro enviado!
```

**Se NÃO aparecer:**
- O código não está sendo executado
- Verifique se o arquivo foi commitado
- Faça novo deploy

**Se aparecer erro:**
- Veja a mensagem de erro
- Pode ser API Key inválida
- Pode ser limite excedido

---

### **5. Verificar no Resend Dashboard**

1. Acesse: https://resend.com/emails
2. Veja se o email aparece na lista
3. Status pode ser:
   - ✅ **Delivered** - Email foi entregue
   - ⏳ **Queued** - Na fila
   - ❌ **Failed** - Falhou

---

### **6. Verificar spam**

1. Abra seu Gmail: michaeldouglasqueiroz@gmail.com
2. Vá na pasta **Spam**
3. Procure por emails de: `onboarding@resend.dev`
4. Se estiver lá, marque como **"Não é spam"**

---

## 🐛 ERROS COMUNS:

### **Erro 1: "Invalid API Key"**

**Causa:** API Key errada ou não configurada

**Solução:**
1. Verifique se a chave está correta na Vercel
2. Não pode ter espaços
3. Deve começar com `re_`
4. Faça redeploy

---

### **Erro 2: "Domain not verified"**

**Causa:** Tentando usar domínio não verificado

**Solução:**
- Já corrigi! Agora usa `onboarding@resend.dev`
- Faça novo deploy

---

### **Erro 3: "Rate limit exceeded"**

**Causa:** Passou do limite de 100 emails/dia (plano grátis)

**Solução:**
- Aguarde 24h
- Ou faça upgrade no Resend

---

### **Erro 4: Código não executa**

**Causa:** Arquivo não foi commitado ou deploy não foi feito

**Solução:**
```bash
# Ver arquivos modificados
git status

# Adicionar todos
git add .

# Commitar
git commit -m "fix: adicionar notificações por email"

# Enviar
git push origin main
```

---

## 🧪 TESTE MANUAL:

### **Criar API de teste:**

Crie o arquivo: `app/api/test-email/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { notifyNewSignupEmail } from '@/lib/email-notifications';

export async function GET() {
  try {
    await notifyNewSignupEmail(
      'Teste Manual',
      'teste@teste.com',
      '11999999999',
      'Restaurante Teste',
      '/teste'
    );
    
    return NextResponse.json({ 
      success: true,
      message: 'Email enviado! Verifique seu email.' 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}
```

**Testar:**
1. Acesse: https://virtualcardapio.com.br/api/test-email
2. Deve retornar: `{"success": true}`
3. Verifique seu email

---

## 📊 VERIFICAR LOGS COMPLETOS:

### **Na Vercel:**

1. Deployments → Último deploy
2. View Function Logs
3. Filtrar por: `email`
4. Procure por:
   ```
   📧 Tentando enviar email...
   ✅ Email enviado!
   ```

### **No Resend:**

1. https://resend.com/emails
2. Veja a lista de emails
3. Clique em um email para ver detalhes
4. Status, horário, erro (se houver)

---

## ✅ SOLUÇÃO DEFINITIVA:

Se nada funcionar, faça isso:

### **1. Commit das mudanças:**
```bash
cd "c:\Users\Administrator\Desktop\MENU DIGITAL\menu-digital-site-2024-8773d37d606448f665f364adadb0de35da0262ad"
git add .
git commit -m "fix: adicionar notificações por email com logs"
git push origin main
```

### **2. Aguardar deploy (2-3 min)**

### **3. Testar cadastro:**
1. https://virtualcardapio.com.br/auth/login?register=true
2. Cadastrar novo usuário
3. Aguardar 5-10 segundos
4. Verificar email

### **4. Ver logs:**
1. Vercel → Deployments → Function Logs
2. Procurar por `📧` ou `✅` ou `❌`

---

## 📞 SE AINDA NÃO FUNCIONAR:

Me envie:

1. **Print dos logs da Vercel** (Function Logs)
2. **Print do Resend Dashboard** (lista de emails)
3. **Print das Environment Variables** (sem mostrar a chave completa)
4. **Confirmação:** Fez redeploy após adicionar a variável?

---

## 🎯 RESUMO RÁPIDO:

```bash
# 1. Adicionar variável na Vercel
RESEND_API_KEY=re_tQiwTekM_5GMqL0La46tW4A05mxQvu7V

# 2. Fazer deploy
git add .
git commit -m "fix: email notifications"
git push origin main

# 3. Aguardar 2-3 min

# 4. Testar cadastro

# 5. Verificar logs da Vercel

# 6. Verificar email (e spam)
```

---

**Siga esse guia e me diga onde travou!** 🔧
