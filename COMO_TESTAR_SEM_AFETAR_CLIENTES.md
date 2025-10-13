# 🧪 COMO TESTAR SEM AFETAR CLIENTES

## 🎯 **REGRA DE OURO:**
```
✅ Clientes usam: master (PRODUÇÃO)
✅ Você testa: develop (STAGING)

NUNCA faça push direto para master!
```

---

## 📋 **PASSO A PASSO (COPIE E COLE):**

### **🔧 QUANDO QUISER FAZER QUALQUER MUDANÇA:**

```bash
# PASSO 1: Vai para branch de testes
git checkout develop

# PASSO 2: Atualiza (pega últimas mudanças)
git pull origin develop

# PASSO 3: Faz suas alterações
# (edita arquivos, adiciona features, corrige bugs, etc)

# PASSO 4: Verifica se está tudo OK
npm run pre-deploy

# PASSO 5: Se OK, salva as mudanças
git add .
git commit -m "descreva o que fez"
git push origin develop

# PASSO 6: Aguarda 2-3 minutos (Vercel fazendo deploy)
```

---

## 🌐 **ONDE TESTAR:**

### **URL DE TESTES (só você vê):**
```
https://menu-digital-site-2024-8773d37d6064-git-develop-michaeldouglasqueiroz.vercel.app
```

### **URL DE PRODUÇÃO (clientes usam):**
```
https://menu-digital-site-2024-8773d37d6064-git-main-michaeldouglasqueiroz.vercel.app
```

**IMPORTANTE:** O Vercel cria URLs diferentes para cada branch automaticamente!

---

## ✅ **CHECKLIST DE TESTES (NO STAGING):**

Depois do deploy no `develop`, teste:

```
✅ [ ] Abra o site de testes (URL develop acima)
✅ [ ] Faça login
✅ [ ] Veja o dashboard
✅ [ ] Clique em "Ver Cardápio"
✅ [ ] Adicione produto ao carrinho
✅ [ ] Finalize um pedido de teste
✅ [ ] Faça upload de uma imagem
✅ [ ] Veja se a mudança que você fez funcionou
✅ [ ] Abra o console (F12) - Veja se tem erro
✅ [ ] Teste no celular (se possível)
```

**Se TUDO estiver OK ✅ → Pode liberar para clientes!**

---

## 🚀 **LIBERAR PARA CLIENTES (SÓ DEPOIS DE TESTAR!):**

```bash
# PASSO 1: Volta para master (produção)
git checkout master

# PASSO 2: Atualiza master
git pull origin master

# PASSO 3: Traz mudanças testadas do develop
git merge develop

# PASSO 4: Envia para produção
git push origin master

# PASSO 5: Aguarda 2-3 minutos

# PASSO 6: Testa DE NOVO em produção
# URL: https://...git-main...vercel.app

# PASSO 7: Se OK → Clientes podem usar! 🎉
```

---

## 🚨 **E SE ALGO DER ERRADO EM PRODUÇÃO?**

### **ROLLBACK RÁPIDO (2 minutos):**

```
1. Acesse: https://vercel.com/dashboard
2. Clique no seu projeto
3. Aba "Deployments"
4. Encontre o deploy anterior (que funcionava)
5. Clique nos 3 pontinhos (...)
6. "Promote to Production"
7. PRONTO! Voltou para versão anterior
```

---

## 📊 **FLUXO VISUAL:**

```
💻 Você desenvolve localmente
    ↓
📝 git push origin develop
    ↓
🟡 STAGING (develop)
    URL: ...git-develop...vercel.app
    👁️ SÓ VOCÊ VÊ E TESTA
    ↓
✅ Testou tudo? OK?
    ↓
📝 git merge develop
    ↓
🟢 PRODUÇÃO (master)
    URL: ...git-main...vercel.app
    👥 CLIENTES USAM
```

---

## 🎯 **COMANDOS MAIS USADOS:**

| O que você quer fazer | Comando |
|-----------------------|---------|
| Ver em qual branch está | `git branch` |
| Ir para testes | `git checkout develop` |
| Ir para produção | `git checkout master` |
| Ver mudanças | `git status` |
| Verificar arquivos | `npm run pre-deploy` |
| Rodar local | `npm run dev` |

---

## 💡 **DICAS IMPORTANTES:**

### **✅ SEMPRE:**
- ✅ Teste no `develop` ANTES de liberar
- ✅ Execute o checklist completo
- ✅ Abra o console (F12) para ver erros
- ✅ Teste no celular quando possível
- ✅ Use aba anônima (Ctrl+Shift+N) para testar

### **❌ NUNCA:**
- ❌ Faça push direto para `master`
- ❌ Libere sem testar no `develop`
- ❌ Pule o checklist
- ❌ Teste diretamente em produção

---

## 🔗 **LINKS RÁPIDOS:**

### **Vercel (ver deploys):**
```
https://vercel.com/dashboard
```

### **GitHub (ver código):**
```
https://github.com/MichaelneGyn/menu-digital-site-2024
```

### **Supabase (banco de dados):**
```
https://supabase.com/dashboard
```

---

## 📱 **VERIFICAR STATUS DO DEPLOY:**

```
1. Acesse: https://vercel.com/dashboard
2. Clique no projeto
3. Veja os deploys:

🟢 Production (master) - Clientes usam
   Status: Ready ✅
   
🟡 Preview (develop) - Você testa
   Status: Ready ✅ ou Building ⏳
```

Só teste quando aparecer "Ready" ✅

---

## ⏱️ **TEMPO NECESSÁRIO:**

```
Desenvolvimento: Varia (1h, 2h, 1 dia, etc)
    ↓
Deploy no develop: 2-3 minutos
    ↓
Testes no staging: 15-20 minutos
    ↓
Deploy em produção: 2-3 minutos
    ↓
Testes em produção: 10 minutos
    ↓
TOTAL: ~30-40 minutos (além do desenvolvimento)
```

**Vale MUITO a pena! Evita problemas com clientes! 💪**

---

## 🎓 **EXEMPLO REAL DO DIA A DIA:**

### **Cenário: Adicionar nova categoria no cardápio**

```bash
# Manhã - 10:00
git checkout develop
git pull origin develop

# Edita os arquivos, adiciona categoria
# ...

npm run pre-deploy
git add .
git commit -m "feat: adiciona categoria sobremesas"
git push origin develop

# Aguarda 3 minutos
# Acessa: https://...git-develop...vercel.app
# Testa tudo (checklist)
# ✅ Funcionou!

# Tarde - 15:00 (depois de testar bem)
git checkout master
git pull origin master
git merge develop
git push origin master

# Aguarda 3 minutos
# Testa de novo em: https://...git-main...vercel.app
# ✅ OK!

# Clientes já podem ver a nova categoria! 🎉
```

---

## 🚨 **TROUBLESHOOTING RÁPIDO:**

### **"Não sei em qual branch estou":**
```bash
git branch
# O que tem * é onde você está
```

### **"Esqueci qual URL é do staging":**
```
Vercel Dashboard → Preview Deployments
Ou: https://...git-develop...vercel.app
```

### **"Fiz besteira, quero descartar mudanças":**
```bash
git checkout .
# Isso descarta TUDO que não foi commitado
```

### **"Merge deu conflito":**
```bash
# Abra os arquivos com conflito
# Resolva manualmente
git add .
git commit -m "merge: resolve conflicts"
git push origin master
```

---

## ✅ **RESUMO DE 3 LINHAS:**

```
1. Sempre desenvolva e faça push para develop
2. Teste TUDO no staging (URL do develop)
3. Só faça merge para master se TUDO estiver OK
```

---

## 🎯 **CHECKLIST MÍNIMO (NÃO PULE!):**

Antes de fazer merge para master:

```
✅ [ ] Testei no staging (develop)
✅ [ ] Login funciona
✅ [ ] Cardápio abre
✅ [ ] Sem erros no console (F12)
✅ [ ] Minha mudança funciona
```

Só faça merge se TODOS estiverem ✅!

---

## 💾 **SALVE ESTE ARQUIVO!**

```
Copie este arquivo para:
- Desktop
- Favoritos
- Google Drive
- Onde você sempre consegue achar!
```

**E consulte SEMPRE antes de fazer deploy!** 🛡️

---

## 📞 **TEM DÚVIDA?**

Consulte:
- `docs/WORKFLOW_BRANCHES.md` (explicação completa)
- `docs/CHECKLIST_POS_DEPLOY.md` (checklist detalhado)
- `COMANDOS_RAPIDOS.md` (comandos úteis)

---

## 🎉 **BOA SORTE!**

**Seguindo este guia, você NUNCA vai quebrar produção para os clientes! 💪✅**
