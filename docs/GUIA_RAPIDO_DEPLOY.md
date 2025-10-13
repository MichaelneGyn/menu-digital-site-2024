# 🚀 GUIA RÁPIDO DE DEPLOY

## ⚡ ANTES DE FAZER PUSH/DEPLOY:

### **1. Execute o verificador:**
```bash
npm run pre-deploy
```

Isso vai verificar se todos os arquivos críticos existem.

---

### **2. Se passar, faça o deploy:**
```bash
git add .
git commit -m "sua mensagem"
git push origin master
```

---

### **3. Aguarde o deploy no Vercel (2-3 min)**

Acesse: https://vercel.com/dashboard

Espere até aparecer **"Ready"** (verde).

---

### **4. SEMPRE execute o checklist:**

Abra: `docs/CHECKLIST_POS_DEPLOY.md`

Execute **TODOS** os testes (20 minutos).

---

## 🚨 SE ALGO DER ERRADO:

### **Erro de autenticação (401):**
1. Vercel → Settings → Environment Variables
2. Verifique `DATABASE_URL`
3. Deve ter `?pgbouncer=true` no final
4. Redeploy

### **Cardápio dá 404:**
1. Execute: `npm run pre-deploy`
2. Verifique se `app/[slug]/page.tsx` existe
3. Se não existir, recupere do Git

### **Upload não funciona:**
1. Verifique variáveis AWS no Vercel
2. Ou desabilite S3 temporariamente

---

## 📋 COMANDOS ÚTEIS:

```bash
# Verificar arquivos críticos
npm run pre-deploy

# Verificar + Lint
npm run check

# Dev local
npm run dev

# Build local (testar antes de deploy)
npm run build
```

---

## 🔒 GOLDEN RULE:

```
❌ NUNCA faça push sem executar:
   npm run pre-deploy

❌ NUNCA divulgue sem executar:
   docs/CHECKLIST_POS_DEPLOY.md

✅ SEMPRE teste localmente antes
✅ SEMPRE verifique logs do Vercel após deploy
```

---

## 📞 EM CASO DE EMERGÊNCIA:

1. Verifique logs no Vercel
2. Execute checklist
3. Rollback se necessário:
   - Vercel → Deployments
   - Deploy anterior → ... → Promote to Production
