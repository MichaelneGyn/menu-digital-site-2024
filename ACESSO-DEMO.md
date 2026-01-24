# 🎯 Acesso de Demonstração

## **Credenciais de Teste**

Para que seus clientes possam testar o sistema sem criar conta:

```
📧 Email: demo@virtualcardapio.com
🔑 Senha: demo123
```

---

## **🚀 Como Criar o Usuário Demo**

### **Opção 1: Script Automático (Recomendado)**

```bash
# Executar o script
npx tsx scripts/create-demo-user.ts
```

**O script cria automaticamente:**
- ✅ Usuário demo
- ✅ Restaurante "Restaurante Demo"
- ✅ Categorias (Pizzas, Bebidas)
- ✅ 5 produtos de exemplo
- ✅ Imagens de exemplo (Unsplash)

### **Opção 2: Manual (SQL)**

Execute no Supabase SQL Editor:

```sql
-- 1. Criar usuário demo
INSERT INTO "User" (id, name, email, password, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Usuário Demo',
  'demo@virtualcardapio.com',
  '$2a$10$YourHashedPasswordHere', -- Hash de 'demo123'
  NOW(),
  NOW()
);

-- 2. Criar restaurante demo
INSERT INTO "Restaurant" (id, name, slug, "userId", phone, address, "deliveryFee", "minOrderValue", "primaryColor", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'Restaurante Demo',
  'demo',
  id,
  '(11) 99999-9999',
  'Rua Demo, 123',
  5.00,
  20.00,
  '#FF6B35',
  true,
  NOW(),
  NOW()
FROM "User"
WHERE email = 'demo@virtualcardapio.com';
```

---

## **📱 Como os Clientes Acessam**

### **Método 1: Botão na Tela de Login**

1. Acesse: `https://seu-site.com/auth/login`
2. Clique no botão azul: **"🎯 ACESSAR DEMONSTRAÇÃO"**
3. Pronto! Acesso automático ao painel admin

### **Método 2: Login Manual**

1. Acesse: `https://seu-site.com/auth/login`
2. Digite:
   - Email: `demo@virtualcardapio.com`
   - Senha: `demo123`
3. Clique em "ENTRAR"

---

## **🎨 O que o Cliente Verá**

### **Painel Administrativo:**
- ✅ Dashboard com estatísticas
- ✅ Produtos cadastrados
- ✅ Categorias criadas
- ✅ Sistema CMV (se ativado)
- ✅ Configurações do restaurante

### **Menu Público:**
- ✅ Acesse: `https://seu-site.com/demo`
- ✅ Menu com produtos de exemplo
- ✅ Carrinho funcional
- ✅ Checkout completo

---

## **⚠️ Limitações da Demo**

### **Recomendado Configurar:**

1. **Modo Somente Leitura (Opcional)**
   - Impedir que demo delete produtos
   - Impedir alterações críticas

2. **Reset Automático (Opcional)**
   - Resetar dados da demo diariamente
   - Manter sempre limpo

3. **Banner de Aviso**
   - Mostrar "MODO DEMONSTRAÇÃO"
   - Avisar que dados são temporários

---

## **🔒 Segurança**

### **Boas Práticas:**

```typescript
// Adicionar verificação em rotas críticas
if (session?.user?.email === 'demo@virtualcardapio.com') {
  // Bloquear ações destrutivas
  return { error: 'Ação não permitida em modo demo' };
}
```

### **Proteções Recomendadas:**

- ❌ Não permitir deletar restaurante
- ❌ Não permitir alterar email/senha
- ❌ Não permitir excluir todos os produtos
- ✅ Permitir criar/editar produtos (para testar)
- ✅ Permitir fazer pedidos de teste

---

## **📊 Monitoramento**

### **Verificar Uso da Demo:**

```sql
-- Ver últimos acessos
SELECT * FROM "Session"
WHERE "userId" IN (
  SELECT id FROM "User"
  WHERE email = 'demo@virtualcardapio.com'
)
ORDER BY "createdAt" DESC
LIMIT 10;
```

---

## **🎯 Dicas para Apresentação**

### **Para Clientes Interessados:**

**Mensagem sugerida:**

> "Quer testar o sistema antes de comprar?
> 
> 🎯 Acesse: https://seu-site.com/auth/login
> 
> Clique em 'ACESSAR DEMONSTRAÇÃO' e explore:
> ✅ Painel administrativo completo
> ✅ Gestão de produtos
> ✅ Sistema de pedidos
> ✅ Relatórios e análises
> 
> Sem precisar criar conta!
> Teste à vontade por 15 minutos."

---

## **🔄 Resetar Demo**

### **Script de Reset (Opcional):**

```bash
# Deletar dados de teste
npx tsx scripts/reset-demo.ts
```

### **Reset Manual:**

```sql
-- Deletar pedidos demo
DELETE FROM "Order"
WHERE "restaurantId" IN (
  SELECT id FROM "Restaurant"
  WHERE slug = 'demo'
);

-- Resetar produtos para estado inicial
-- (executar script create-demo-user.ts novamente)
```

---

## **✅ Checklist de Setup**

- [ ] Script `create-demo-user.ts` executado
- [ ] Usuário demo criado
- [ ] Restaurante demo criado
- [ ] Produtos de exemplo adicionados
- [ ] Botão "ACESSAR DEMONSTRAÇÃO" visível
- [ ] Testado acesso via botão
- [ ] Testado acesso manual
- [ ] Menu público acessível em `/demo`
- [ ] Proteções de segurança implementadas (opcional)

---

## **🎉 Pronto!**

Seus clientes agora podem testar o sistema completo sem criar conta!

**Acesso:**
- 📧 demo@virtualcardapio.com
- 🔑 demo123

**URLs:**
- Admin: `/auth/login` → Botão "ACESSAR DEMONSTRAÇÃO"
- Menu: `/demo`

---

**Dúvidas?** Veja a documentação completa em `DOCUMENTACAO-COMPLETA.md`
