# 🎯 Criar Conta de Demonstração

## **Passo a Passo Rápido:**

### **1. Executar o Script:**

```bash
npx tsx scripts/create-demo-user.ts
```

**Aguarde 10-20 segundos...**

### **2. Resultado:**

```
✅ Usuário demo criado com sucesso!

📋 Credenciais de acesso:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: demo@virtualcardapio.com
🔑 Senha: demo123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Restaurante demo criado!
✅ Categorias criadas!
✅ Produtos criados!

🎉 SETUP COMPLETO!
```

### **3. Testar:**

```bash
# Iniciar servidor (se não estiver rodando)
npm run dev

# Acessar
http://localhost:3001/auth/login
```

**Clique no botão azul:** **"🎯 ACESSAR DEMONSTRAÇÃO"**

---

## **✅ Pronto!**

Agora você tem:
- ✅ Usuário demo criado
- ✅ Restaurante "Restaurante Demo"
- ✅ 2 Categorias (Pizzas, Bebidas)
- ✅ 5 Produtos de exemplo
- ✅ Botão de acesso rápido na tela de login

---

## **📱 Como Compartilhar com Clientes:**

### **Opção 1: Link + Botão**
```
"Teste o sistema agora:
https://seu-site.com/auth/login

Clique em 'ACESSAR DEMONSTRAÇÃO'"
```

### **Opção 2: Credenciais Diretas**
```
"Credenciais de teste:

📧 demo@virtualcardapio.com
🔑 demo123

Acesse: https://seu-site.com/auth/login"
```

---

## **🔄 Resetar Demo (Opcional):**

Se quiser limpar dados de teste:

```bash
npx tsx scripts/reset-demo.ts
```

Isso deleta pedidos e recria produtos iniciais.

---

## **❌ Se der erro:**

### **Erro: "User already exists"**
```bash
# Usuário já existe, está tudo certo!
# Pode usar: demo@virtualcardapio.com / demo123
```

### **Erro: "Prisma Client not found"**
```bash
npx prisma generate
npx tsx scripts/create-demo-user.ts
```

### **Erro: "Database connection failed"**
```bash
# Verificar .env
# DATABASE_URL deve estar configurado
```

---

## **🎉 Sucesso!**

Conta demo criada e funcionando!

**Credenciais:**
- 📧 demo@virtualcardapio.com
- 🔑 demo123
