# ✅ CHECKLIST PÓS-DEPLOY - OBRIGATÓRIO!

Execute TODA VEZ que fizer deploy em produção (Vercel).

---

## 🚀 **ANTES DE DIVULGAR PARA CLIENTES:**

### **1. Autenticação (5 min)**
```
✅ [ ] Login funciona (admin)
✅ [ ] Logout funciona
✅ [ ] Dashboard carrega
✅ [ ] Não dá erro 401
```

**Teste:**
1. Acesse: `https://seu-site.vercel.app/auth/login`
2. Faça login com email/senha
3. Deve redirecionar para `/admin/dashboard`
4. Faça logout
5. Deve redirecionar para `/auth/login`

---

### **2. Cardápio Público (3 min)**
```
✅ [ ] Cardápio abre pelo slug (/x-lanches)
✅ [ ] Produtos aparecem
✅ [ ] Imagens carregam
✅ [ ] Botão "Ver Cardápio" no dashboard funciona
```

**Teste:**
1. Dashboard → Clique em "Ver Cardápio"
2. Deve abrir `https://seu-site.vercel.app/x-lanches`
3. Cardápio deve aparecer completo
4. Imagens dos produtos devem carregar

---

### **3. Criação de Pedidos (5 min)**
```
✅ [ ] Adicionar item ao carrinho
✅ [ ] Ver carrinho
✅ [ ] Finalizar pedido
✅ [ ] Pedido aparece no dashboard
```

**Teste:**
1. Acesse o cardápio público
2. Adicione 2-3 produtos ao carrinho
3. Finalize o pedido
4. Volte ao dashboard
5. Verifique se o pedido apareceu

---

### **4. Upload de Imagens (3 min)**
```
✅ [ ] Upload de imagem funciona
✅ [ ] Imagem aparece no produto
✅ [ ] Imagem aparece no cardápio público
```

**Teste:**
1. Dashboard → Adicionar Item
2. Faça upload de uma imagem
3. Salve o item
4. Veja no cardápio público se a imagem apareceu

---

### **5. Configurações do Restaurante (2 min)**
```
✅ [ ] Editar informações funciona
✅ [ ] Horário de funcionamento funciona
✅ [ ] PIX configurado
```

**Teste:**
1. Dashboard → Editar Informações
2. Altere algo (nome, endereço)
3. Salve
4. Recarregue e veja se salvou

---

## 🔴 **SE ALGO FALHAR:**

### **Falhou login:**
1. Verifique `DATABASE_URL` no Vercel
2. Deve ter `?pgbouncer=true` no final
3. Redeploy

### **Falhou cardápio (404):**
1. Verifique se arquivo `app/[slug]/page.tsx` existe
2. Verifique se restaurante tem slug no banco
3. Execute: `SELECT name, slug FROM "Restaurant";`

### **Falhou upload:**
1. Verifique variáveis AWS no Vercel
2. Ou use storage local para testes

### **Falhou pedidos:**
1. Verifique logs no Vercel
2. Veja se rate limiting não está bloqueando

---

## 📊 **FREQUÊNCIA:**

```
✅ SEMPRE após deploy em produção
✅ Antes de divulgar para novos clientes
✅ Após mudanças críticas (auth, banco, pagamento)
✅ Uma vez por semana (manutenção)
```

---

## ⏱️ **TEMPO TOTAL: ~20 minutos**

Melhor investir 20 minutos testando do que ter cliente reclamando! 💪

---

## 🚨 **ALERTA VERMELHO (PARAR TUDO!):**

Se algum destes falhar, **NÃO DIVULGUE** até corrigir:
- ❌ Login não funciona
- ❌ Cardápio dá 404
- ❌ Pedidos não aparecem no dashboard
- ❌ Pagamento não funciona (quando ativar)

---

## 📞 **EM CASO DE DÚVIDA:**

1. Verifique logs no Vercel
2. Teste em aba anônima (sem cache)
3. Teste em outro dispositivo/rede
4. Me chame se persistir!
