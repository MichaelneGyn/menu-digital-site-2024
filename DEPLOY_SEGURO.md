# 🛡️ GUIA DE DEPLOY SEGURO - ZERO DOWNTIME

## 📋 **CHECKLIST PRÉ-DEPLOY (OBRIGATÓRIO)**

Antes de fazer qualquer deploy, siga esta lista:

### **1. Testar Localmente**
```bash
npm run build        # Build deve passar sem erros
npm run start        # Testar produção local
```

### **2. Verificar Health Check**
```bash
# Abra no navegador:
http://localhost:3000/api/health

# Deve retornar:
{
  "status": "healthy",
  "ok": true,
  "database": "connected"
}
```

### **3. Testar Funcionalidades Críticas**
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Página pública do restaurante funciona
- [ ] Adicionar produto funciona
- [ ] Fazer pedido funciona

---

## 🚀 **WORKFLOW DE DEPLOY SEGURO**

### **NUNCA faça deploy direto para master!**

### **Método Correto:**

#### **Passo 1: Criar Branch de Feature**
```bash
git checkout -b feature/nome-da-mudanca
```

#### **Passo 2: Fazer Mudanças**
```bash
# Edite seus arquivos
git add .
git commit -m "feat: descrição clara da mudança"
```

#### **Passo 3: Push para Preview**
```bash
git push origin feature/nome-da-mudanca
```

**⏰ Aguarde 2-3 minutos para o Vercel criar a Preview URL**

#### **Passo 4: Testar Preview URL**
1. Vá no Vercel → Deployments
2. Encontre o deploy da sua branch
3. Clique em **"Visit"**
4. **TESTE TUDO!** Especialmente:
   - `/api/health` deve retornar OK
   - Login
   - Páginas principais
   - Funcionalidades que você mudou

#### **Passo 5: Se Tudo OK, Fazer Merge**
```bash
git checkout master
git merge feature/nome-da-mudanca
git push origin master
```

#### **Passo 6: Monitorar Deploy em Produção**
1. Vá no Vercel → Deployments
2. Aguarde o deploy completar (1-2 min)
3. Assim que aparecer **"Ready"**, teste:
   - `https://virtualcardapio.com.br`
   - `https://virtualcardapio.com.br/api/health`

---

## 🆘 **SE O DEPLOY DER PROBLEMA**

### **Rollback Instantâneo (5 segundos):**

1. Vá em **Vercel** → **Deployments**
2. Encontre o deploy anterior que funcionava (antes do problemático)
3. Clique em **"..."** (três pontinhos)
4. Clique em **"Promote to Production"**
5. **✅ Site volta ao normal em 5 segundos!**

---

## 📊 **MONITORAMENTO CONTÍNUO**

### **Usar UptimeRobot (Grátis)**

1. Acesse: https://uptimerobot.com
2. Crie conta grátis
3. Adicione monitor:
   - **URL:** `https://virtualcardapio.com.br/api/health`
   - **Tipo:** HTTP(s)
   - **Intervalo:** 5 minutos
   - **Notificação:** Seu email/WhatsApp

**O que faz:**
- ✅ Verifica o site a cada 5 minutos
- ✅ Se cair, te avisa IMEDIATAMENTE
- ✅ Histórico de uptime
- ✅ Grátis até 50 monitores!

---

## 🔔 **CONFIGURAR ALERTAS DO VERCEL**

1. Vá em **Vercel** → Seu Projeto → **Settings** → **Notifications**
2. Ative:
   - ✅ **Deployment Failed**
   - ✅ **Deployment Succeeded**
   - ✅ **Production Deployment**

3. Adicione seu email/Slack/Discord

---

## 🧪 **TESTES AUTOMATIZADOS (Recomendado)**

Crie testes para funcionalidades críticas:

```bash
# Instalar Playwright
npm install -D @playwright/test

# Criar teste básico
npx playwright codegen https://virtualcardapio.com.br
```

---

## 📈 **MÉTRICAS DE SUCESSO**

### **Alvos:**
- ✅ **Uptime:** 99.9% (máximo 43 minutos de downtime/mês)
- ✅ **Tempo de Rollback:** < 1 minuto
- ✅ **Deploys sem erro:** > 95%

### **Como medir:**
- UptimeRobot mostra uptime automaticamente
- Vercel mostra histórico de deploys

---

## ⚡ **DEPLOY DE EMERGÊNCIA**

### **Se precisar fazer hotfix urgente:**

```bash
# 1. Criar branch de hotfix
git checkout -b hotfix/correcao-urgente

# 2. Fazer correção
git add .
git commit -m "hotfix: correção urgente"

# 3. Push direto para master (só em emergência!)
git checkout master
git merge hotfix/correcao-urgente
git push origin master

# 4. Monitorar deploy no Vercel
```

---

## 🎯 **RESUMO - REGRAS DE OURO**

```
✅ SEMPRE testar em Preview URL antes de produção
✅ NUNCA fazer deploy direto sem testar
✅ SEMPRE ter UptimeRobot monitorando
✅ SEMPRE verificar /api/health após deploy
✅ SABER fazer rollback rápido (< 1 min)
✅ TER email configurado para alertas do Vercel
```

---

## 🛠️ **COMANDOS ÚTEIS**

```bash
# Ver último deploy
vercel ls

# Ver logs de produção
vercel logs

# Fazer rollback via CLI
vercel rollback

# Build local para testar
npm run build && npm run start
```

---

## 📞 **CONTATOS DE EMERGÊNCIA**

- **Vercel Status:** https://vercel-status.com
- **Supabase Status:** https://status.supabase.com  
- **Seu Monitoramento:** https://uptimerobot.com

---

**ÚLTIMA ATUALIZAÇÃO:** 22/10/2025
**VERSÃO:** 1.0
**AUTOR:** Cascade AI
