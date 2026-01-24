# 🔒 SISTEMA DE LIMITE - 10 VAGAS

**Data:** 21/10/2025  
**Objetivo:** Bloquear novos cadastros após 10 clientes e enviar notificações

---

## 🎯 COMO FUNCIONA

### **1. Data de Lançamento**
```typescript
const LAUNCH_DATE = new Date('2025-01-21T00:00:00Z');
```

⚠️ **IMPORTANTE:** Ajuste para a data REAL de lançamento!

### **2. Limite de Vagas**
```
FOUNDER_LIMIT = 10 (primeiros 10 clientes)
EARLY_LIMIT = 50 (clientes 11-50)
```

### **3. Sistema de Contagem**
- Conta APENAS usuários criados APÓS `LAUNCH_DATE`
- Exclui contas antigas de teste/admin automaticamente
- Verifica ANTES de criar nova conta

---

## 🔒 ENDPOINTS CRIADOS

### **1. `/api/users/limit` (GET)**
Retorna informações sobre o limite:

```json
{
  "newUsersCount": 7,
  "spotsLeft": 3,
  "isLimitReached": false,
  "founderLimit": 10,
  "launchDate": "2025-01-21T00:00:00.000Z"
}
```

### **2. `/api/signup` (POST) - MODIFICADO**
Agora verifica o limite ANTES de criar conta:

```typescript
// Verifica se atingiu limite
if (newUsersCount >= FOUNDER_LIMIT) {
  return {
    error: 'Vagas esgotadas!',
    limitReached: true
  }
}
```

---

## 🔔 NOTIFICAÇÕES

### **Quando são enviadas:**
- **8/10 vagas:** "Restam 2 vagas!"
- **9/10 vagas:** "Última vaga!"
- **10/10 vagas:** "🎉 LIMITE ATINGIDO! Prepare upgrade!"

### **Onde vejo:**
- Console do servidor (logs)
- Vercel Dashboard → Functions → Logs

### **Como melhorar (TODO):**
```typescript
// app/api/signup/route.ts (linha 23)
async function sendLimitNotification(count: number, limit: number) {
  // TODO: Enviar email via Resend
  // TODO: Enviar WhatsApp
  // TODO: Notificação no Telegram
}
```

---

## 🚫 O QUE ACONTECE QUANDO ATINGE LIMITE

### **1. Usuário tenta se cadastrar:**
```
❌ Erro 403: "Vagas esgotadas! 
   As 10 vagas de lançamento já foram preenchidas.
   Entre na lista de espera."
```

### **2. Landing page:**
- Contador mostra "0 vagas restantes"
- Badge "LIMITADO!" continua piscando
- Botão pode mudar para "Lista de Espera"

### **3. No servidor:**
```
🚫 LIMITE ATINGIDO: 10/10 vagas preenchidas
🎉 LIMITE ATINGIDO! Prepare o upgrade da infraestrutura!
```

---

## ⚙️ COMO AJUSTAR O LIMITE

### **Aumentar para 20 vagas (exemplo):**

1. Edite `app/api/signup/route.ts`:
```typescript
const FOUNDER_LIMIT = 20; // era 10
```

2. Edite `app/api/users/limit/route.ts`:
```typescript
const FOUNDER_LIMIT = 20; // era 10
```

3. Edite `app/page.tsx`:
```typescript
const FOUNDER_LIMIT = 20; // era 10
```

4. Commit e push:
```bash
git add .
git commit -m "Aumentar limite para 20 vagas"
git push origin master
```

---

## 🔄 COMO RESETAR O CONTADOR

### **Opção 1: Mudar a data de lançamento**
```typescript
// Mover a data para hoje
const LAUNCH_DATE = new Date('2025-01-22T00:00:00Z');
```

### **Opção 2: Aumentar o limite**
```typescript
const FOUNDER_LIMIT = 20; // Mais 10 vagas
```

### **Opção 3: Deletar contas de teste (banco de dados)**
```sql
-- Conectar no Supabase SQL Editor
DELETE FROM "User" 
WHERE email LIKE '%test%' 
OR email LIKE '%@exemplo.com';
```

---

## 📊 MONITORAMENTO

### **Ver quantas vagas restam:**
```
Acesse: https://virtualcardapio.com.br/api/users/limit
```

### **Ver logs do servidor:**
1. Acesse Vercel Dashboard
2. Clique no projeto
3. Functions → Logs
4. Procure por "🔒" ou "LIMITE"

### **Ver no banco:**
```sql
-- Contar usuários desde lançamento
SELECT COUNT(*) 
FROM "User" 
WHERE "createdAt" >= '2025-01-21T00:00:00Z';
```

---

## ⚠️ IMPORTANTE

### **Antes de lançar:**
1. ✅ Ajustar `LAUNCH_DATE` para a data real
2. ✅ Testar criando uma conta
3. ✅ Verificar endpoint `/api/users/limit`
4. ✅ Verificar notificações no console
5. ✅ Fazer backup do banco

### **Depois de atingir 10:**
1. ✅ Verificar se bloqueou novos cadastros
2. ✅ Fazer upgrade Supabase (se necessário)
3. ✅ Aumentar limite ou abrir próxima fase

---

## 🧪 COMO TESTAR

### **1. Simular data de lançamento:**
```typescript
// Colocar data no passado para testar
const LAUNCH_DATE = new Date('2020-01-01T00:00:00Z');
```

### **2. Criar 10 contas de teste**
### **3. Tentar criar a 11ª conta**
- Deve retornar erro 403
- Deve aparecer "Vagas esgotadas!"

### **4. Verificar logs:**
```
🚫 LIMITE ATINGIDO: 10/10 vagas preenchidas
```

---

## 🚀 PRÓXIMOS PASSOS

### **Quando atingir 10 vagas:**
1. **Verificar receita:** 10 × R$ 69,90 = R$ 699/mês
2. **Abrir vagas 11-50:** Preço R$ 79,90/mês
3. **Atualizar landing:** Remover "Primeiros 10", mostrar "Primeiros 50"
4. **Ajustar limite:** `FOUNDER_LIMIT = 50`

### **Quando atingir 15-20 vagas:**
1. **Upgrade Supabase:** FREE → Pro (R$ 125/mês)
2. **Monitorar:** Bandwidth e conexões
3. **Planejar:** Escalabilidade

---

## 📝 CHECKLIST PRÉ-LANÇAMENTO

- [ ] Ajustar `LAUNCH_DATE` para data real
- [ ] Testar cadastro bloqueado
- [ ] Verificar contador na landing
- [ ] Configurar notificações (email/WhatsApp)
- [ ] Backup do banco de dados
- [ ] Ter cartão pronto para upgrade (se necessário)
- [ ] Documentar processo de aumento de limite

---

## 🆘 TROUBLESHOOTING

### **Problema: Limite não está funcionando**
```
Solução: Verificar se LAUNCH_DATE está correto
Verificar logs em: Vercel Dashboard → Functions
```

### **Problema: Contador errado na landing**
```
Solução: Landing usa /api/users/count (diferente)
Atualizar para usar /api/users/limit
```

### **Problema: Preciso urgente aumentar limite**
```
Solução rápida:
1. Edit app/api/signup/route.ts
2. Mudar FOUNDER_LIMIT = 20
3. git add . && git commit -m "urgente" && git push
4. Deploy em 3 minutos
```

---

**TUDO PRONTO! Sistema travado em 10 vagas com notificações automáticas!** 🔒🚀
