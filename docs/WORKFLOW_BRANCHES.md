# 🌳 WORKFLOW DE BRANCHES - GUIA COMPLETO

## 📊 **ESTRUTURA DE AMBIENTES:**

```
┌─────────────────────────────────────────────────────────────┐
│  🔵 LOCAL (localhost:3001)                                  │
│  Onde você desenvolve                                       │
│  Branch: develop                                            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ git push origin develop
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  🟡 STAGING (Preview - Vercel)                              │
│  Onde você TESTA antes de liberar                           │
│  URL: menu-digital-site-develop.vercel.app                  │
│  Branch: develop                                            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Depois de testar, merge para master
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  🟢 PRODUÇÃO (Production - Vercel)                          │
│  Onde os CLIENTES usam                                      │
│  URL: menu-digital-site.vercel.app                          │
│  Branch: master                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ **WORKFLOW DIA A DIA:**

### **CENÁRIO 1: Fazer uma melhoria/correção**

```bash
# 1. Certifique-se de estar no branch develop
git checkout develop

# 2. Atualize o branch
git pull origin develop

# 3. Faça suas alterações nos arquivos
# (edite, adicione funcionalidades, etc)

# 4. Verifique antes de commit
npm run pre-deploy

# 5. Se OK, faça commit
git add .
git commit -m "feat: adiciona nova funcionalidade X"

# 6. Push para develop
git push origin develop

# 7. Vercel vai fazer deploy automaticamente em PREVIEW!
# URL: https://menu-digital-site-develop.vercel.app
```

---

### **CENÁRIO 2: Testar no ambiente de staging**

```bash
# 1. Depois do push no develop, aguarde 2-3 min

# 2. Acesse a URL de preview:
https://menu-digital-site-develop.vercel.app

# 3. Execute o checklist (docs/CHECKLIST_POS_DEPLOY.md)

# 4. Teste TUDO:
✅ Login funciona?
✅ Cardápio abre?
✅ Pedidos funcionam?
✅ Upload funciona?
✅ Nova funcionalidade OK?

# 5. Se TUDO OK → Vai para produção (cenário 3)
# 6. Se ALGO FALHOU → Corrija e repita do cenário 1
```

---

### **CENÁRIO 3: Liberar para produção (clientes)**

```bash
# ⚠️ SÓ FAÇA ISSO SE:
# ✅ Testou tudo no staging
# ✅ Executou o checklist completo
# ✅ Tem CERTEZA que está funcionando

# 1. Volte para o branch master
git checkout master

# 2. Atualize o master
git pull origin master

# 3. Merge do develop (traz as mudanças testadas)
git merge develop

# 4. Push para produção
git push origin master

# 5. Vercel faz deploy em PRODUÇÃO
# URL: https://menu-digital-site.vercel.app

# 6. AGUARDE 2-3 min

# 7. Execute checklist de novo (produção)
# docs/CHECKLIST_POS_DEPLOY.md

# 8. Se OK → CLIENTES PODEM USAR! 🎉
```

---

### **CENÁRIO 4: EMERGÊNCIA - Rollback rápido**

```bash
# Se algo quebrou em produção:

# Opção A: Rollback no Vercel (mais rápido)
1. Vercel Dashboard → Deployments
2. Encontre o deploy anterior (que funcionava)
3. ... → Promote to Production

# Opção B: Reverter commit
git checkout master
git revert HEAD  # reverte último commit
git push origin master
```

---

## 📋 **REGRAS DE OURO:**

### **❌ NUNCA:**
- ❌ Faça push direto para `master` sem testar
- ❌ Teste em produção
- ❌ Pule o checklist
- ❌ Merge sem testar no staging

### **✅ SEMPRE:**
- ✅ Desenvolva no `develop`
- ✅ Teste no staging PRIMEIRO
- ✅ Execute checklist ANTES de produção
- ✅ Faça merge `develop → master` só quando tudo OK

---

## 🎯 **COMANDOS RÁPIDOS:**

### **Ver em qual branch você está:**
```bash
git branch
```

### **Trocar para develop:**
```bash
git checkout develop
```

### **Trocar para master (produção):**
```bash
git checkout master
```

### **Ver diferenças entre branches:**
```bash
git diff master develop
```

### **Listar todos os branches:**
```bash
git branch -a
```

---

## 📊 **EXEMPLO PRÁTICO COMPLETO:**

### **Dia 1: Adicionar nova funcionalidade**

```bash
# Manhã - Desenvolver
git checkout develop
git pull origin develop

# Adiciona funcionalidade X
# (edita arquivos, etc)

npm run pre-deploy  # Verifica arquivos
git add .
git commit -m "feat: adiciona funcionalidade X"
git push origin develop

# Tarde - Testar no staging
# Acessa: https://menu-digital-site-develop.vercel.app
# Executa checklist
# ✅ Tudo OK!
```

### **Dia 2: Liberar para clientes**

```bash
# Manhã - Deploy em produção
git checkout master
git pull origin master
git merge develop
git push origin master

# Aguarda 3 min
# Acessa: https://menu-digital-site.vercel.app
# Executa checklist de novo
# ✅ Tudo OK!

# Clientes podem usar! 🎉
```

---

## 🚨 **TROUBLESHOOTING:**

### **Conflito ao fazer merge:**

```bash
git checkout master
git merge develop

# Se der conflito:
# 1. Resolva manualmente os conflitos
# 2. git add .
# 3. git commit -m "merge: resolve conflicts"
# 4. git push origin master
```

### **Esqueci em qual branch estou:**

```bash
git branch
# O branch com * é o atual
```

### **Quero descartar mudanças locais:**

```bash
git checkout .  # descarta tudo
git checkout -- arquivo.ts  # descarta arquivo específico
```

---

## 📱 **VERIFICAR DEPLOYMENTS NO VERCEL:**

### **Production (master):**
```
Vercel Dashboard → Production Deployments
URL: https://menu-digital-site.vercel.app
```

### **Preview (develop):**
```
Vercel Dashboard → Preview Deployments
URL: https://menu-digital-site-develop.vercel.app
```

---

## 🎓 **RESUMO VISUAL:**

```
💻 Você desenvolve
    ↓
🔵 LOCAL (localhost:3001)
    ↓ git push origin develop
🟡 STAGING (preview) - TESTE AQUI!
    ↓ git merge develop
🟢 PRODUÇÃO - CLIENTES USAM
```

---

## ✅ **CHECKLIST ANTES DE CADA MERGE PARA MASTER:**

```
✅ [ ] Testou no staging (preview)
✅ [ ] Executou checklist completo
✅ [ ] Login funciona
✅ [ ] Cardápio funciona
✅ [ ] Pedidos funcionam
✅ [ ] Upload funciona
✅ [ ] Nova funcionalidade testada
✅ [ ] Sem erros no console
✅ [ ] Performance OK
✅ [ ] Mobile testado
✅ [ ] Rollback plan (sabe como reverter)
```

Só faça merge se **TODOS** estiverem ✅!

---

## 🎯 **GOLDEN RULE:**

```
"Se você não testaria com seu próprio dinheiro,
 não coloque em produção!"
```

**SEMPRE teste no staging PRIMEIRO!** 🛡️
