# 🔧 Scripts - Utilitários do Projeto

Scripts organizados por categoria.

---

## 📁 **ESTRUTURA:**

### **`database/`**
Scripts SQL para consultas e manutenção do banco de dados.

**Exemplos:**
- `check-restaurant-slug.sql` - Ver slugs dos restaurantes
- `verificar-dados.sql` - Verificar dados

**⚠️ CUIDADO:** Alguns scripts podem alterar dados!

---

### **`utils/`**
Scripts JavaScript utilitários.

**Exemplos:**
- `verificar-arquivos-criticos.js` - Verifica arquivos essenciais (rode antes de deploy!)
- `testar-conexao.js` - Testa conexão com banco
- `gerar-hash-senha.js` - Gera hash de senha

**Como usar:**
```bash
node scripts/utils/nome-do-script.js
```

---

### **`local/`**
Scripts para rodar servidor localmente (Windows).

**Exemplos:**
- `start-local.bat` - Inicia servidor local
- `meu-ip.bat` - Mostra seu IP local

**Como usar:**
```cmd
.\scripts\local\start-local.bat
```

---

## ⚡ **SCRIPTS MAIS USADOS:**

### **Antes de Deploy:**
```bash
npm run pre-deploy
# Executa: scripts/utils/verificar-arquivos-criticos.js
```

### **Verificar Banco:**
```sql
-- No Supabase SQL Editor:
-- Cole e execute: scripts/database/check-restaurant-slug.sql
```

### **Servidor Local:**
```bash
npm run dev
# Ou:
.\scripts\local\start-local.bat
```

---

## 📋 **CRIAR NOVO SCRIPT:**

Se criar um script novo, coloque na pasta certa:
- SQL → `database/`
- JavaScript → `utils/`
- Bat/PowerShell → `local/`

---

## ⚠️ **AVISO:**

- ⚠️ Scripts em `database/` podem **alterar dados**
- ⚠️ Scripts antigos em `/archive/scripts-antigos/` **NÃO devem ser executados**
- ✅ Scripts em `utils/` são seguros para rodar

---

**🔧 Scripts organizados e prontos para uso!**
