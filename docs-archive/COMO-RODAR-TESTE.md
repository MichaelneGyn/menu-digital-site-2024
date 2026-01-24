# 🧪 COMO RODAR O TESTE DE SEGURANÇA

## 📋 PRÉ-REQUISITOS

- Node.js instalado (você já tem!)
- Seu site no ar (Vercel)

---

## 🚀 PASSO A PASSO (2 MINUTOS)

### **1️⃣ Abrir Terminal**

**No VS Code:**
1. Aperte: `Ctrl + '` (abre terminal embaixo)
2. Ou: Menu → Terminal → New Terminal

**Você deve ver algo como:**
```
PS C:\Users\Administrator\Desktop\MENU DIGITAL\menu-digital-site-2024...>
```

---

### **2️⃣ Rodar o Teste**

**Digite este comando:**
```bash
node test-security-auto.js
```

**Aperte:** Enter

---

### **3️⃣ Aguardar Resultado (30 segundos)**

Você verá:
```
═══════════════════════════════════════════════════
   🔒 TESTE AUTOMÁTICO DE SEGURANÇA
═══════════════════════════════════════════════════

Site: https://seu-site.vercel.app

[TESTE 1] Headers de Segurança
✅ X-Frame-Options
✅ X-Content-Type-Options
✅ X-XSS-Protection
✅ Referrer-Policy

[TESTE 2] Proteção de APIs
✅ PATCH sem autenticação bloqueado

[TESTE 3] Rate Limiting
✅ Rate Limiting ativo
   Bloqueadas: 12/70 | Sucesso: 58/70

[TESTE 4] Supabase RLS
✅ RLS bloqueia upload sem SERVICE_ROLE

[TESTE 5] SQL Injection Protection
✅ SQL Injection bloqueado

[TESTE 6] HTTPS
✅ Site usa HTTPS

[TESTE 7] Sistema Online
✅ API respondendo

═══════════════════════════════════════════════════
   📊 RESULTADO FINAL
═══════════════════════════════════════════════════

   Total de Testes: 11
   ✅ Passou: 11
   ❌ Falhou: 0

   Score de Segurança: 100%
   ████████████████████████████████████████

   🛡️  SISTEMA MUITO SEGURO!
   Pronto para produção.

═══════════════════════════════════════════════════
```

---

## 🎯 **INTERPRETANDO RESULTADOS:**

### **✅ Verde = BOM**
```
Tudo funcionando corretamente
Proteção ativa
```

### **❌ Vermelho = PROBLEMA**
```
Algo precisa ser corrigido
Me mostre o erro!
```

### **⚠️ Amarelo = ATENÇÃO**
```
Funciona mas pode melhorar
Não crítico
```

---

## 📊 **SCORE:**

```
85-100%  = 🛡️  MUITO SEGURO (Produção OK)
70-84%   = ✅  SEGURO (Produção OK)
50-69%   = ⚠️  ATENÇÃO (Corrigir antes)
0-49%    = 🚨  CRÍTICO (Não usar)
```

---

## 🔧 **CONFIGURAÇÃO (OPCIONAL):**

Se quiser testar Supabase RLS também:

1. Abra: `test-security-auto.js`
2. Linha 26-28, edite:
   ```javascript
   supabaseUrl: 'https://seu-projeto.supabase.co',
   anonKey: 'sua-anon-key-aqui'
   ```
3. Salve
4. Rode novamente: `node test-security-auto.js`

---

## ❓ **PROBLEMAS COMUNS:**

### **Erro: "node não é reconhecido"**
```
Node.js não instalado ou não no PATH

Solução:
1. Baixe: https://nodejs.org/
2. Instale
3. Reinicie VS Code
4. Tente novamente
```

### **Erro: "Cannot find module"**
```
Arquivo não encontrado

Solução:
1. Verifique se está na pasta certa:
   cd "C:\Users\Administrator\Desktop\MENU DIGITAL\menu-digital-site-2024..."
2. Rode: node test-security-auto.js
```

### **Timeout ou Erro de Conexão**
```
Site pode estar fora do ar ou deploy não terminou

Solução:
1. Aguarde 2 minutos
2. Tente novamente
3. Verifique se site abre no navegador
```

---

## 🎉 **APÓS O TESTE:**

```
✅ Score 70%+: Sistema está seguro!
✅ Pode usar em produção
✅ Começar a vender

⚠️ Score <70%: Me mostre o resultado
⚠️ Vou corrigir o que falhou
```

---

## 📞 **PRECISA DE AJUDA?**

1. Tire print do resultado
2. Me mostre
3. Eu analiso e corrijo

---

**🚀 RODE AGORA: `node test-security-auto.js`**
