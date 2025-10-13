# 🔍 DEBUG: QR CODE PIX NÃO APARECE NO CHECKOUT

## ⚠️ **PROBLEMA:**
- QR Code foi gerado no dashboard ✅
- Mas NÃO aparece no checkout do cardápio ❌

---

## 🔧 **TESTE 1: Verificar se foi salvo no banco**

### Passo 1:
```bash
1. Vá para: http://localhost:3001/admin/dashboard
2. Clique em "Editar Informações"
3. Role até "💳 Configurações PIX"
4. Verifique:
   - Campo "Chave PIX": 62982175770 ✅
   - Campo "QR Code PIX": https://api.qrserver.com/... ✅
   - Prévia do QR Code aparece? ✅
```

**Se a prévia aparece no dashboard, o dado FOI SALVO.**

---

## 🔧 **TESTE 2: Verificar no Console do Navegador**

### Passo 2:
```bash
1. Vá para: http://localhost:3001/md-burges
2. Abra o Console (F12 → Console)
3. Adicione itens ao carrinho
4. Vá para o checkout
5. Procure no console por:
   "🔍 Payment Options - PIX Data"
```

**O que verificar:**
```javascript
🔍 Payment Options - PIX Data: {
  pixKey: "62982175770",           // ✅ Deve ter valor
  pixQrCode: "https://api...",     // ✅ Deve ter URL
  hasPixKey: true,                 // ✅ Deve ser true
  hasPixQrCode: true               // ✅ Deve ser true
}
```

**Se `pixQrCode` está `null` ou `undefined`, o problema é na API.**

---

## 🐛 **POSSÍVEIS CAUSAS:**

### Causa 1: Campo não está na query do banco
O arquivo `lib/restaurant.ts` pode não estar incluindo o campo `pixQrCode`.

### Causa 2: Cache do navegador
O navegador pode estar usando dados antigos em cache.

### Causa 3: URL inválida
A URL do QR Code pode estar mal formatada.

---

## ✅ **SOLUÇÃO RÁPIDA:**

### 1. Limpe o cache:
```
Ctrl + Shift + R (hard reload)
```

### 2. Verifique a URL do QR Code:
```
Deve ser assim:
https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=62982175770

NÃO assim:
00020126580014br.gov.bcb.pix...
```

### 3. Teste a URL diretamente:
```
1. Copie a URL do QR Code do dashboard
2. Cole em uma nova aba do navegador
3. O QR Code deve aparecer como imagem
```

---

## 🔍 **PRÓXIMOS PASSOS:**

Por favor, faça os testes acima e me informe:

1. ✅ A prévia do QR Code aparece no dashboard?
2. ✅ O console mostra `hasPixQrCode: true`?
3. ✅ A URL do QR Code abre como imagem no navegador?

Com essas informações, poderei identificar o problema exato!
