# ✅ CHECKLIST ANTES DE DEPLOY - OBRIGATÓRIO!

Execute **ANTES** de fazer `git push` para produção!

---

## 🔍 **1. VERIFICAR CÓDIGO (2 min)**

```bash
# Ver em qual branch está
git branch

# Se não estiver no develop, vá para ele
git checkout develop

# Verifique se tem mudanças no schema do Prisma
git diff HEAD prisma/schema.prisma
```

**Se o schema mudou:**
⚠️ **ALERTA! Precisa sincronizar banco antes do deploy!**

---

## 🗄️ **2. SINCRONIZAR BANCO (se schema mudou)**

### **Se alterou `prisma/schema.prisma`:**

**OBRIGATÓRIO: Atualizar banco Supabase!**

```bash
# Opção A: Usar script automático
node scripts/utils/verificar-schema-mudou.js

# Opção B: SQL manual no Supabase
# Abra: scripts/database/sincronizar-banco-completo.sql
# Execute no Supabase SQL Editor
```

**NUNCA faça deploy se o schema mudou sem atualizar o banco!** ⚠️

---

## ✅ **3. VERIFICAR ARQUIVOS CRÍTICOS**

```bash
npm run pre-deploy
```

**Deve aparecer:**
```
✅ Arquivos OK: X
⚠️  Avisos: 0
❌ Erros: 0
```

**Se der erro:**
- ❌ **NÃO FAÇA DEPLOY!**
- ✅ Corrija os arquivos faltando
- ✅ Rode `npm run pre-deploy` de novo

---

## 🧪 **4. TESTAR LOCALMENTE**

```bash
npm run dev
```

**Teste:**
- ✅ Login funciona?
- ✅ Dashboard abre?
- ✅ Cardápio funciona?
- ✅ Criar pedido funciona?
- ✅ Upload funciona?
- ✅ Sem erros no console? (F12)

**Se algo falhou:**
- ❌ **NÃO FAÇA DEPLOY!**
- ✅ Corrija o problema
- ✅ Teste de novo

---

## 📝 **5. COMMIT E PUSH**

```bash
# Adiciona mudanças
git add .

# Commit
git commit -m "descreva o que fez"

# Push para develop (staging)
git push origin develop
```

---

## ⏱️ **6. AGUARDAR DEPLOY NO STAGING**

```
1. Acesse: https://vercel.com/dashboard
2. Aguarde deploy do develop terminar (2-3 min)
3. Status deve ficar: Ready ✅
```

---

## 🧪 **7. TESTAR NO STAGING**

```
URL: https://...git-develop...vercel.app
```

**Execute o checklist completo:**
- [ ] Login
- [ ] Dashboard
- [ ] Ver cardápio
- [ ] Adicionar produto ao carrinho
- [ ] Finalizar pedido
- [ ] Upload de imagem
- [ ] Console sem erros (F12)

**Se TUDO OK ✅:**
- Pode ir para produção!

**Se ALGO FALHOU ❌:**
- Corrija no develop
- Repita do passo 5

---

## 🚀 **8. DEPLOY EM PRODUÇÃO**

```bash
# Vai para master
git checkout master

# Atualiza master
git pull origin master

# Merge do develop (traz mudanças testadas)
git merge develop

# Push para produção
git push origin master
```

---

## ⏱️ **9. AGUARDAR DEPLOY EM PRODUÇÃO**

```
1. Acesse: https://vercel.com/dashboard
2. Aguarde deploy do master terminar (2-3 min)
3. Status deve ficar: Ready ✅
```

---

## 🎯 **10. TESTAR EM PRODUÇÃO**

```
URL: https://...git-main...vercel.app
```

**Execute o checklist DE NOVO:**
- [ ] Login
- [ ] Dashboard
- [ ] Ver cardápio
- [ ] Criar pedido
- [ ] Upload
- [ ] Console sem erros

**Se TUDO OK ✅:**
- 🎉 **DEPLOY CONCLUÍDO COM SUCESSO!**
- Clientes podem usar!

**Se ALGO FALHOU ❌:**
- 🚨 **ROLLBACK IMEDIATO!**
- Vercel → Deployments → Deploy anterior → Promote
- Corrija no develop e repita processo

---

## 🚨 **PROBLEMAS COMUNS:**

### **"Erro ao criar pedido":**
```
Causa: Banco desatualizado
Solução: Execute sincronizar-banco-completo.sql no Supabase
```

### **"404 ao acessar cardápio":**
```
Causa: Arquivo app/[slug]/page.tsx faltando
Solução: npm run pre-deploy (vai detectar)
```

### **"Erro 401 autenticação":**
```
Causa: DATABASE_URL sem ?pgbouncer=true
Solução: Adicione no final da URL no Vercel
```

---

## ⏱️ **TEMPO TOTAL:**

```
Verificações: 5 min
Deploy staging: 3 min
Testes staging: 15 min
Deploy produção: 3 min
Testes produção: 10 min
──────────────────────
TOTAL: ~35-40 minutos
```

**Vale a pena! Evita quebrar produção!** 💪

---

## 📋 **RESUMO DE 5 PASSOS:**

```
1. ✅ npm run pre-deploy
2. ✅ Teste local (npm run dev)
3. ✅ Push para develop
4. ✅ Teste no staging
5. ✅ Se OK, merge para master
```

---

## 🎯 **GOLDEN RULE:**

```
❌ NUNCA pule testes no staging
❌ NUNCA faça merge sem testar
❌ NUNCA ignore erros no console
✅ SEMPRE teste antes de produção
✅ SEMPRE tenha rollback plan
```

---

**💾 SALVE ESTE ARQUIVO E CONSULTE SEMPRE!**
