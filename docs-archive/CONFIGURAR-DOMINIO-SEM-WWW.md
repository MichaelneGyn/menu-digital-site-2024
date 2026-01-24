# 🌐 CONFIGURAR DOMÍNIO SEM WWW

## ❌ PROBLEMA ATUAL:
- ✅ Funciona: `www.virtualcardapio.com.br`
- ❌ Não funciona: `virtualcardapio.com.br` (sem www)

## ✅ SOLUÇÃO COMPLETA:

### **PASSO 1: CONFIGURAR NO VERCEL** 🚀

1. **Acesse o Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Clique no projeto: `menu-digital-site-2024`

2. **Vá em Settings → Domains**

3. **Adicione AMBOS os domínios:**
   ```
   virtualcardapio.com.br
   www.virtualcardapio.com.br
   ```

4. **Configure o domínio principal:**
   - Clique nos 3 pontinhos ao lado de `virtualcardapio.com.br`
   - Marque como **"Primary Domain"** (Domínio Principal)

5. **Redirecionar www → sem www:**
   - O `www` vai redirecionar automaticamente para o domínio sem www
   - Isso já está configurado no `vercel.json` agora

---

### **PASSO 2: CONFIGURAR DNS (Registro.br)** 🌐

Você precisa adicionar **2 registros DNS**:

#### **Registro A (Domínio Raiz)**
```
Tipo: A
Nome: @  (ou deixe vazio)
Valor: 76.76.21.21
TTL: 3600 (ou 1 hora)
```

#### **Registro CNAME (www)**
```
Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com
TTL: 3600 (ou 1 hora)
```

---

### **PASSO 3: COMO FAZER NO REGISTRO.BR** 📝

1. **Acesse:** https://registro.br
2. **Login** com sua conta
3. **Meus Domínios** → Selecione `virtualcardapio.com.br`
4. **Editar Zona DNS**
5. **Adicione os registros acima**
6. **Salvar alterações**

---

### **PASSO 4: AGUARDAR PROPAGAÇÃO** ⏱️

- **Tempo de propagação:** 5 minutos a 48 horas
- **Média:** 1-2 horas
- **Testar em:** https://dnschecker.org

---

## 🎯 CONFIGURAÇÃO IDEAL (RECOMENDADA):

### **Opção 1: SEM WWW (Recomendado) ✅**
- Domínio principal: `virtualcardapio.com.br`
- Redirecionar: `www.virtualcardapio.com.br` → `virtualcardapio.com.br`
- **Vantagem:** URL mais curta e moderna

### **Opção 2: COM WWW**
- Domínio principal: `www.virtualcardapio.com.br`
- Redirecionar: `virtualcardapio.com.br` → `www.virtualcardapio.com.br`

**Eu configurei para a Opção 1 (sem www)**

---

## 📋 CHECKLIST DE VERIFICAÇÃO:

**No Vercel:**
- [ ] Ambos domínios adicionados
- [ ] `virtualcardapio.com.br` marcado como Primary
- [ ] SSL/HTTPS ativado (automático)

**No Registro.br:**
- [ ] Registro A: `@ → 76.76.21.21`
- [ ] Registro CNAME: `www → cname.vercel-dns.com`

**Testes:**
- [ ] `virtualcardapio.com.br` abre o site
- [ ] `www.virtualcardapio.com.br` redireciona para sem www
- [ ] Ambos com HTTPS (🔒)

---

## 🔧 COMANDOS PARA TESTAR DNS:

**Windows (PowerShell):**
```powershell
# Testar domínio raiz
nslookup virtualcardapio.com.br

# Testar www
nslookup www.virtualcardapio.com.br
```

**Ou use online:**
- https://dnschecker.org
- https://mxtoolbox.com/SuperTool.aspx

---

## ⚠️ PROBLEMAS COMUNS:

### **Problema 1: "Domain is not verified"**
**Solução:** Aguarde a propagação DNS (até 48h)

### **Problema 2: "SSL Certificate Error"**
**Solução:** Vercel gera SSL automaticamente após DNS propagar (até 24h)

### **Problema 3: "404 Not Found"**
**Solução:** 
1. Verifique se o domínio está adicionado no Vercel
2. Reaplique o deploy: `git push origin master`

---

## 🎯 RESULTADO ESPERADO:

Depois da configuração:
- ✅ `virtualcardapio.com.br` → **FUNCIONA**
- ✅ `www.virtualcardapio.com.br` → **Redireciona** para sem www
- ✅ Ambos com **HTTPS** (🔒)
- ✅ Login/cadastro funcionando
- ✅ Sistema completo operacional

---

## 📞 SUPORTE:

Se após 48 horas ainda não funcionar:
1. Verifique DNS em: https://dnschecker.org
2. Contate suporte Registro.br: https://registro.br/suporte
3. Verifique logs do Vercel: https://vercel.com/dashboard

---

## 🚀 PRÓXIMOS PASSOS:

Após domínio funcionando:
1. ✅ Testar login/cadastro
2. ✅ Criar primeiro restaurante
3. ✅ Postar no Instagram
4. 🎯 **BUSCAR PRIMEIRO CLIENTE!**

---

**Atualizado:** 21/10/2025 08:33
**Status:** Configuração pronta para aplicar
