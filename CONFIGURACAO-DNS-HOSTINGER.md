# Configuração DNS - Hostinger para Vercel

## 🎯 CONFIGURAÇÃO DEFINITIVA (SOLUÇÃO PARA RESETS)

### Domínio: virtualcardapio.com.br
### Provedor: Hostinger
### Hospedagem: Vercel
### **Status: CONFIGURAÇÃO ALIAS/CNAME IMPLEMENTADA** ✅

## ⚙️ CONFIGURAÇÃO DEFINITIVA - EVITA RESETS

### **SOLUÇÃO IMPLEMENTADA (DEZEMBRO 2024)**

**PROBLEMA RESOLVIDO:** Site "resetava" configuração DNS automaticamente

**SOLUÇÃO:** Usar ALIAS/CNAME ao invés de registros A

### 1. Configuração Atual (DEFINITIVA)

```
@ (root)     →  ALIAS   →  cname.vercel-dns.com  ✅
www          →  CNAME   →  cname.vercel-dns.com  ✅
```

### 2. Como Configurar no Hostinger

1. **Acesse:** Painel Hostinger → DNS/Nameservers
2. **Delete:** Todos os registros A antigos
3. **Adicione:**
   - **Tipo:** ALIAS (ou ANAME)
   - **Nome:** @ (domínio raiz)
   - **Aponta para:** cname.vercel-dns.com
   - **TTL:** 14400

4. **Adicione:**
   - **Tipo:** CNAME
   - **Nome:** www
   - **Aponta para:** cname.vercel-dns.com
   - **TTL:** 14400

### 3. VANTAGENS DESTA CONFIGURAÇÃO

✅ **Nunca mais "reseta"** - Vercel gerencia automaticamente
✅ **Sempre atualizado** - IPs são gerenciados pelo Vercel
✅ **Mais rápido** - ALIAS é superior ao registro A
✅ **Sem manutenção** - Configuração definitiva

## 🚨 CONFIGURAÇÕES ANTIGAS (NÃO USAR MAIS)

### ❌ Registros A (CAUSAVAM RESETS)
```
@ → A → 76.76.21.164  ❌ (IP pode mudar)
@ → A → 216.198.7.91  ❌ (IP pode mudar)
```

**PROBLEMA:** Vercel muda IPs periodicamente, causando "resets"

## 🚨 PROBLEMAS COMUNS E SOLUÇÕES

### Problema 1: "Alteração não foi salva"
**Solução:**
- Limpe cache do navegador
- Tente em navegador privado/incógnito
- Use outro navegador
- Aguarde alguns minutos e tente novamente

### Problema 2: "Nameservers não propagaram"
**Verificar:**
```bash
nslookup -type=NS virtualcardapio.com.br
```
**Se ainda mostrar nameservers antigos:**
- Aguarde mais tempo (até 48h)
- Verifique se salvou corretamente na Hostinger

### Problema 3: "Site ainda não carrega"
**Verificar:**
```bash
nslookup virtualcardapio.com.br
```
**Deve mostrar IPs do Vercel (76.76.21.x)**

## ✅ VERIFICAÇÃO FINAL

### Comandos para testar:
```bash
# Verificar nameservers
nslookup -type=NS virtualcardapio.com.br

# Verificar IPs
nslookup virtualcardapio.com.br

# Testar conectividade
curl -I https://virtualcardapio.com.br
```

### Resultados esperados:
- Nameservers: `ns1.vercel-dns.com` e `ns2.vercel-dns.com`
- IPs: `76.76.21.x` (Vercel)
- Status: `200 OK`

## 📞 CONTATOS DE EMERGÊNCIA

### Hostinger Suporte:
- Chat: Disponível no painel
- Email: [verificar no painel]

### Vercel Suporte:
- Status: https://vercel.com/status
- Docs: https://vercel.com/docs/concepts/projects/domains

## 🔄 BACKUP - URL SEMPRE FUNCIONA
**Em caso de problemas com domínio:**
https://menu-digital-site-2024-8773d37d606448f665f364adadb0de35da0262ad.vercel.app