# ⚡ COMANDOS RÁPIDOS

## 🔄 **WORKFLOW NORMAL:**

### **1. Desenvolver (no develop):**
```bash
git checkout develop
git pull origin develop
# (faz alterações)
npm run pre-deploy
git add .
git commit -m "sua mensagem"
git push origin develop
```

### **2. Testar:**
```
URL: https://menu-digital-site-develop.vercel.app
Execute: docs/CHECKLIST_POS_DEPLOY.md
```

### **3. Liberar para clientes:**
```bash
git checkout master
git pull origin master
git merge develop
git push origin master
```

---

## 🎯 **COMANDOS MAIS USADOS:**

| Comando | O que faz |
|---------|-----------|
| `git checkout develop` | Vai para branch de testes |
| `git checkout master` | Vai para branch de produção |
| `git branch` | Mostra em qual branch você está |
| `git pull origin develop` | Atualiza branch develop |
| `npm run pre-deploy` | Verifica arquivos críticos |
| `npm run dev` | Roda local (localhost:3001) |

---

## 🚨 **EMERGÊNCIA:**

### **Reverter deploy em produção:**
```
Vercel Dashboard → Deployments
Encontra deploy anterior → ... → Promote to Production
```

### **Ver o que mudou:**
```bash
git status  # arquivos alterados
git diff    # ver alterações
```

---

## 📍 **ONDE ESTOU?**

```bash
git branch
# O que tem * é onde você está
```

---

## 🔗 **LINKS ÚTEIS:**

- 📦 **GitHub:** https://github.com/MichaelneGyn/menu-digital-site-2024
- 🚀 **Vercel Dashboard:** https://vercel.com/dashboard
- 🟢 **Produção:** https://menu-digital-site-2024...vercel.app
- 🟡 **Staging:** https://menu-digital-site-2024-develop...vercel.app
- 🗄️ **Supabase:** https://supabase.com/dashboard

---

## 📚 **DOCUMENTAÇÃO COMPLETA:**

- `docs/WORKFLOW_BRANCHES.md` - Workflow completo
- `docs/CHECKLIST_POS_DEPLOY.md` - Checklist obrigatório
- `docs/GUIA_RAPIDO_DEPLOY.md` - Guia de deploy
- `docs/CORRECOES_SEGURANCA_PENDENTES.md` - Melhorias futuras
