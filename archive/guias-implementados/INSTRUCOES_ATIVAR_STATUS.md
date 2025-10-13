# 🔧 Instruções para Ativar Sistema de Status de Pedidos

## ⚠️ O que aconteceu?

Você está vendo o erro porque as novas colunas do banco de dados ainda não foram criadas. O sistema está pronto, só precisamos aplicar as mudanças no banco.

---

## 📝 Passos para Ativar (LOCAL):

### 1️⃣ **Pare o servidor Next.js**
```bash
# No terminal onde está rodando, pressione:
Ctrl + C
```

### 2️⃣ **Gere o Prisma Client**
```bash
npx prisma generate
```

### 3️⃣ **Aplique as mudanças no banco**
```bash
npx prisma db push
```
*Isso vai adicionar as novas colunas no banco:*
- `confirmedAt`, `preparingAt`, `readyAt`, `deliveredAt`, `cancelledAt`
- `estimatedTime`
- `trackingUrl`
- `notificationSent`

### 4️⃣ **Inicie o servidor novamente**
```bash
npm run dev
```

### 5️⃣ **Teste o sistema**
```
Acesse: http://localhost:3001/admin/kitchen
```

---

## 🚀 Para Produção (Vercel):

O banco de produção já tem as colunas novas! Basta fazer push:

```bash
git push origin master
```

O Vercel vai fazer o deploy automaticamente.

---

## ✅ Após ativar, você terá:

- ✅ Painel de Comandos funcionando
- ✅ Mudança de status dos pedidos
- ✅ Notificações WhatsApp automáticas
- ✅ Rastreamento para clientes
- ✅ Histórico de status

---

## 🆘 Se der erro no `db push`:

Caso você tenha pedidos antigos no banco local, pode limpar com:

```bash
# CUIDADO: Isso apaga TODOS os dados locais
npx prisma migrate reset
```

Ou se preferir manter os dados, use:

```bash
npx prisma migrate dev --name add-order-tracking
```

---

## 📱 Como Testar:

1. **Faça um pedido** no cardápio
2. **Acesse** `/admin/kitchen`
3. **Clique** em "Marcar como Confirmado"
4. **Veja** a notificação WhatsApp sendo gerada
5. **Acesse** o link de rastreamento como cliente

---

## 💡 Dica:

Se quiser testar só a interface sem aplicar no banco, o painel já está funcionando! Só não conseguirá mudar os status até rodar o `db push`.

---

**Qualquer dúvida, me chame! 🚀**
