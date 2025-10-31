# 🔧 CORRIGIR ERRO - AdminNotification

## ❌ **ERRO:**
```
The table `public.AdminNotification` does not exist in the current database.
```

## ✅ **SOLUÇÃO:**

### **Passo 1: Abrir Supabase**
1. Acesse: https://supabase.com
2. Selecione seu projeto
3. Clique em **"SQL Editor"** no menu lateral

### **Passo 2: Executar SQL**
Copie e cole o SQL abaixo:

```sql
-- Criar tabela AdminNotification
CREATE TABLE IF NOT EXISTS "AdminNotification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "restaurantId" TEXT NOT NULL,

    CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("id")
);

-- Criar índices
CREATE INDEX IF NOT EXISTS "AdminNotification_restaurantId_idx" ON "AdminNotification"("restaurantId");
CREATE INDEX IF NOT EXISTS "AdminNotification_read_idx" ON "AdminNotification"("read");
CREATE INDEX IF NOT EXISTS "AdminNotification_createdAt_idx" ON "AdminNotification"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "AdminNotification_type_idx" ON "AdminNotification"("type");

-- Adicionar foreign keys
ALTER TABLE "AdminNotification" 
ADD CONSTRAINT "AdminNotification_restaurantId_fkey" 
FOREIGN KEY ("restaurantId") 
REFERENCES "Restaurant"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;

ALTER TABLE "AdminNotification" 
ADD CONSTRAINT "AdminNotification_userId_fkey" 
FOREIGN KEY ("userId") 
REFERENCES "User"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;
```

### **Passo 3: Clicar em "Run"**
✅ Deve aparecer: "Success. No rows returned"

### **Passo 4: Verificar**
```sql
SELECT * FROM "AdminNotification" LIMIT 1;
```
✅ Deve retornar vazio (sem erro)

---

## 🚀 **DEPOIS DE EXECUTAR:**

### **Opção 1: Aguardar Deploy Automático**
- Vercel vai fazer redeploy automaticamente
- Aguarde 2-3 minutos

### **Opção 2: Forçar Redeploy**
```powershell
# No terminal
vercel --prod
```

---

## ✅ **PRONTO!**

Erro corrigido! O sistema de notificações agora vai funcionar.

---

## 📝 **O QUE É AdminNotification?**

Sistema de notificações para o admin do restaurante:
- ✅ Novos pedidos
- ✅ Pedidos cancelados
- ✅ Chamadas de garçom
- ✅ Alertas do sistema
- ✅ Contador de não lidas

---

**EXECUTE O SQL E ESTÁ RESOLVIDO! 🎉**
