# Configuração DNS - Hostinger para Vercel

## 🎯 CONFIGURAÇÃO ATUAL FUNCIONANDO

### Domínio: virtualcardapio.com.br
### Provedor: Hostinger
### Hospedagem: Vercel

## ⚙️ CONFIGURAÇÃO CORRETA NA HOSTINGER

### 1. Acessar Painel Hostinger
- Login: [seu email]
- Ir em "Domínios" → "Gerenciar"

### 2. Configurar Nameservers
**OPÇÃO RECOMENDADA: Nameservers Personalizados**

```
Nameserver 1: ns1.vercel-dns.com
Nameserver 2: ns2.vercel-dns.com
```

**PASSOS:**
1. Clique em "Alterar nameservers"
2. Selecione "Nameservers personalizados"
3. Digite os nameservers do Vercel
4. **IMPORTANTE**: Clique em "Salvar" e aguarde confirmação
5. Aguarde propagação (15min-24h)

### 3. Configuração Alternativa (Registros A)
**Se nameservers não funcionarem:**

1. Mantenha "Nameservers da Hostinger"
2. Vá em "Zona DNS"
3. Configure registros A:

```
Tipo: A
Nome: @ (ou deixe vazio)
Valor: 76.76.21.164
TTL: 3600

Tipo: A  
Nome: www
Valor: 76.76.21.164
TTL: 3600
```

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