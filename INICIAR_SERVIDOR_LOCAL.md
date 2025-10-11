# 🚀 Como Iniciar o Servidor Local - OnPedido

## ⚡ **MÉTODO RÁPIDO (Recomendado)**

### **Windows PowerShell:**
```powershell
.\start-local.ps1
```

### **Windows Command Prompt:**
```cmd
start-local.bat
```

---

## 🔧 **O QUE OS SCRIPTS FAZEM AUTOMATICAMENTE**

✅ **Verificam se o Node.js está instalado**
✅ **Instalam dependências se necessário** (`npm install`)
✅ **Criam arquivo .env com SQLite local**
✅ **Configuram o Prisma automaticamente**
✅ **Aplicam migrações do banco**
✅ **Criam usuário admin padrão**
✅ **Liberam a porta 3001 se ocupada**
✅ **Iniciam o servidor de desenvolvimento**

---

## 📋 **INFORMAÇÕES IMPORTANTES**

### **🌐 URL Local:**
```
http://localhost:3001
```

### **👤 Credenciais de Admin:**
```
Email: michaeldouglasqueiroz@gmail.com
Senha: admin123
```

### **💾 Banco de Dados:**
- **Desenvolvimento:** SQLite local (`dev.db`)
- **Produção:** PostgreSQL (Supabase)

---

## 🛠️ **MÉTODO MANUAL (Se os scripts não funcionarem)**

### **1. Instalar dependências:**
```bash
npm install
```

### **2. Configurar arquivo .env:**
```bash
# Copiar exemplo
cp .env.example .env

# Editar .env com:
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="33cbd296f38c21eb822a6645a922fe43926e458712cccf22927ce16fc7f6fe1"
```

### **3. Configurar Prisma:**
```bash
# Gerar cliente
npx prisma generate

# Aplicar migrações
npx prisma db push --accept-data-loss
```

### **4. Criar usuário admin:**
```bash
npx tsx scripts/restore-admin.ts
```

### **5. Iniciar servidor:**
```bash
npm run dev
```

---

## 🚨 **SOLUÇÃO DE PROBLEMAS**

### **❌ Erro: "EADDRINUSE: address already in use :::3001"**

**Solução 1 - PowerShell:**
```powershell
# Encontrar processo na porta 3001
netstat -ano | findstr :3001

# Finalizar processo (substitua XXXX pelo PID)
taskkill /PID XXXX /F
```

**Solução 2 - Usar porta diferente:**
```bash
npm run dev -- -p 3002
```

### **❌ Erro: "P1000: Authentication failed"**

**Causa:** Tentando conectar no PostgreSQL em vez do SQLite

**Solução:**
```bash
# Verificar se .env está correto:
DATABASE_URL="file:./dev.db"

# Regenerar Prisma:
npx prisma generate
npx prisma db push
```

### **❌ Erro: "Failed to load resource: 401 (Unauthorized)"**

**Causa:** Problema na configuração do NextAuth

**Solução:**
```bash
# Verificar .env:
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="33cbd296f38c21eb822a6645a922fe43926e458712cccf22927ce16fc7f6fe1"

# Recriar usuário admin:
npx tsx scripts/restore-admin.ts
```

### **❌ Erro: "Module not found"**

**Solução:**
```bash
# Limpar cache e reinstalar:
rm -rf node_modules package-lock.json
npm install
```

---

## 📁 **ESTRUTURA DE ARQUIVOS IMPORTANTES**

```
projeto/
├── .env                    # Configurações locais
├── .env.example           # Exemplo de configuração
├── start-local.ps1        # Script PowerShell
├── start-local.bat        # Script Batch
├── prisma/
│   ├── schema.prisma      # Schema do banco
│   └── dev.db            # Banco SQLite local
├── scripts/
│   └── restore-admin.ts   # Script para criar admin
└── package.json          # Dependências
```

---

## 🎯 **CHECKLIST RÁPIDO**

Antes de iniciar, verifique:

- [ ] Node.js instalado (versão 18+)
- [ ] Estar na pasta raiz do projeto
- [ ] Arquivo `package.json` existe
- [ ] Porta 3001 livre

---

## 💡 **DICAS EXTRAS**

### **🔄 Reiniciar completamente:**
```bash
# Parar servidor (Ctrl+C)
# Limpar banco local
rm prisma/dev.db

# Executar script novamente
.\start-local.ps1
```

### **🔍 Verificar logs:**
```bash
# Ver logs do servidor em tempo real
npm run dev

# Ver logs do Prisma
npx prisma studio
```

### **🌐 Acessar admin:**
1. Abrir: http://localhost:3001/auth/login
2. Email: `michaeldouglasqueiroz@gmail.com`
3. Senha: `admin123`
4. Ir para: http://localhost:3001/admin/dashboard

---

## 📞 **SUPORTE**

Se ainda tiver problemas:

1. **Verifique os logs** no terminal
2. **Execute os scripts automáticos** primeiro
3. **Siga o método manual** se necessário
4. **Consulte a documentação** do projeto

---

**✅ Com estes scripts, o servidor local SEMPRE funcionará!** 🚀