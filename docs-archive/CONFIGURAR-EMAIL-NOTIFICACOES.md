# 📧 CONFIGURAR NOTIFICAÇÕES POR EMAIL

## ✅ O QUE FOI CRIADO:

Você vai receber emails automáticos no seu email pessoal quando:
- 🎉 **Novo cadastro** - Alguém criar conta
- 💰 **Novo pagamento** - Cliente pagar assinatura
- ❌ **Cancelamento** - Cliente cancelar
- ⏰ **Trial acabando** - Faltando poucos dias

---

## 🚀 PASSO A PASSO PARA ATIVAR:

### **1. Criar conta no Resend (GRÁTIS)**

1. Acesse: https://resend.com
2. Clique em **"Sign Up"**
3. Cadastre-se com seu email
4. Confirme o email

---

### **2. Pegar a API Key**

1. Após logar, vá em: **"API Keys"** no menu lateral
2. Clique em **"Create API Key"**
3. Nome: `Virtual Cardápio Prod`
4. Permissões: **"Sending access"**
5. Clique em **"Create"**
6. **COPIE A CHAVE** (só aparece uma vez!)
   - Exemplo: `re_123abc456def789`

---

### **3. Adicionar no .env.local**

1. Abra o arquivo `.env.local` na raiz do projeto
2. Adicione esta linha:

```env
RESEND_API_KEY=re_SUA_CHAVE_AQUI
```

**Exemplo completo do `.env.local`:**
```env
# Supabase
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-secret-aqui"

# Resend (EMAIL)
RESEND_API_KEY=re_SUA_CHAVE_AQUI
```

---

### **4. Verificar domínio (OPCIONAL - Para produção)**

**Para localhost/teste:**
- ✅ Funciona sem verificar domínio
- ✅ Emails vão para seu email pessoal
- ❌ Pode cair no spam

**Para produção (virtualcardapio.com.br):**

1. No Resend, vá em **"Domains"**
2. Clique em **"Add Domain"**
3. Digite: `virtualcardapio.com.br`
4. Adicione os registros DNS que o Resend mostrar:
   - **MX**: `feedback-smtp.us-east-1.amazonses.com`
   - **TXT**: `v=spf1 include:amazonses.com ~all`
   - **CNAME**: `_amazonses.virtualcardapio.com.br`

5. Aguarde 24-48h para propagar
6. Clique em **"Verify"**

---

### **5. Testar**

1. Reinicie o servidor:
```bash
npm run dev
```

2. Faça um cadastro de teste:
   - Acesse: http://localhost:3000/auth/login?register=true
   - Cadastre um novo usuário
   - Nome: `Teste Email`
   - Email: `teste@teste.com`
   - WhatsApp: `11999999999`

3. Verifique seu email: `michaeldouglasqueiroz@gmail.com`
4. Deve chegar um email: **"🎉 Novo Cadastro - Teste Email"**

---

## 📧 EMAILS QUE VOCÊ VAI RECEBER:

### **1. Novo Cadastro:**
```
De: Virtual Cardápio <noreply@virtualcardapio.com>
Para: michaeldouglasqueiroz@gmail.com
Assunto: 🎉 Novo Cadastro - João Silva

[Email bonito com HTML]
- Nome
- Email
- WhatsApp
- Restaurante
- Trial
- Botão para ver no painel
```

### **2. Novo Pagamento:**
```
De: Virtual Cardápio <noreply@virtualcardapio.com>
Para: michaeldouglasqueiroz@gmail.com
Assunto: 💰 Novo Pagamento - R$ 69,90

[Email bonito com HTML]
- Nome do cliente
- Valor pago
- Plano
- Data
```

### **3. Cancelamento:**
```
De: Virtual Cardápio <noreply@virtualcardapio.com>
Para: michaeldouglasqueiroz@gmail.com
Assunto: ❌ Assinatura Cancelada - João Silva

[Email bonito com HTML]
- Nome do cliente
- Tempo que ficou
- Data do cancelamento
```

### **4. Trial Acabando:**
```
De: Virtual Cardápio <noreply@virtualcardapio.com>
Para: michaeldouglasqueiroz@gmail.com
Assunto: ⏰ Trial Acabando - João Silva (3 dias)

[Email bonito com HTML]
- Nome do cliente
- Dias restantes
- Sugestão de ação
```

---

## 🔧 TROUBLESHOOTING:

### **Problema 1: Email não chega**

**Solução:**
1. Verifique se a API Key está correta no `.env.local`
2. Reinicie o servidor (`npm run dev`)
3. Verifique o spam
4. Veja os logs no terminal:
   ```
   ✅ Email de novo cadastro enviado para: michaeldouglasqueiroz@gmail.com
   ```

---

### **Problema 2: Erro "Invalid API Key"**

**Solução:**
1. Verifique se copiou a chave completa
2. Não pode ter espaços antes/depois
3. Deve começar com `re_`
4. Exemplo correto:
   ```env
   RESEND_API_KEY=re_123abc456def789
   ```

---

### **Problema 3: Email cai no spam**

**Solução:**
1. Marque como "Não é spam" no Gmail
2. Adicione `noreply@virtualcardapio.com` nos contatos
3. Para resolver definitivamente: Verifique o domínio (passo 4)

---

### **Problema 4: "Domain not verified"**

**Solução:**
1. Para testes: Ignore (funciona mesmo assim)
2. Para produção: Siga o passo 4 (Verificar domínio)

---

## 📊 LIMITES DO RESEND:

### **Plano Gratuito:**
- ✅ 3.000 emails/mês
- ✅ 100 emails/dia
- ✅ Suficiente para começar

### **Se precisar mais:**
- **Pro**: $20/mês - 50.000 emails
- **Business**: $80/mês - 200.000 emails

---

## ✅ CHECKLIST FINAL:

- [ ] Conta criada no Resend
- [ ] API Key copiada
- [ ] API Key adicionada no `.env.local`
- [ ] Servidor reiniciado
- [ ] Teste de cadastro feito
- [ ] Email recebido

---

## 🎯 PRÓXIMOS PASSOS (OPCIONAL):

### **Melhorias futuras:**

1. **WhatsApp** - Notificações instantâneas
2. **Telegram Bot** - Grátis e rápido
3. **Dashboard de Emails** - Ver histórico
4. **Templates personalizados** - Mais bonitos

---

## 📞 SUPORTE:

Se não funcionar, me envie:
1. Print do `.env.local` (sem mostrar a chave completa)
2. Print dos logs do terminal
3. Print do erro (se houver)

---

## 🎉 PRONTO!

Agora você vai receber emails automáticos sempre que:
- 🎉 Alguém se cadastrar
- 💰 Alguém pagar
- ❌ Alguém cancelar
- ⏰ Trial estiver acabando

**Tudo no seu email pessoal: michaeldouglasqueiroz@gmail.com** ✅
