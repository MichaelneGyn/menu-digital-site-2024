# Protocolo de Deploy Seguro - virtualcardapio.com.br

## ⚠️ PROBLEMA IDENTIFICADO

Durante o deploy de hoje, o erro de DNS foi causado por **configurações no arquivo vercel.json** que interferem com o domínio principal.

### Causa Raiz do Problema:
- O arquivo `vercel.json` contém redirects e configurações de domínio
- Mudanças neste arquivo podem afetar o DNS e acessibilidade do site
- Não havia verificação automática pós-deploy

## 🔒 PROTOCOLO OBRIGATÓRIO ANTES DE QUALQUER DEPLOY

### 1. PRÉ-DEPLOY - VERIFICAÇÕES OBRIGATÓRIAS

```bash
# 1. Verificar se o domínio está funcionando ANTES do deploy
curl -I https://virtualcardapio.com.br
nslookup virtualcardapio.com.br

# 2. Fazer backup das configurações críticas
cp vercel.json vercel.json.backup
cp next.config.js next.config.js.backup
```

### 2. ARQUIVOS CRÍTICOS - NUNCA ALTERAR SEM APROVAÇÃO

❌ **PROIBIDO ALTERAR SEM AUTORIZAÇÃO EXPRESSA:**
- `vercel.json` - Contém configurações de domínio
- `next.config.js` - Headers de segurança
- Qualquer arquivo relacionado a DNS/domínio

### 3. PÓS-DEPLOY - VERIFICAÇÃO AUTOMÁTICA OBRIGATÓRIA

```bash
# Aguardar 2 minutos após deploy
sleep 120

# Verificar se o site está acessível
curl -f https://virtualcardapio.com.br || echo "❌ ERRO: Site não acessível!"

# Verificar DNS
nslookup virtualcardapio.com.br || echo "❌ ERRO: DNS não resolve!"

# Verificar redirect www
curl -I https://www.virtualcardapio.com.br | grep "301\|302" || echo "❌ ERRO: Redirect não funciona!"
```

### 4. CHECKLIST OBRIGATÓRIO PÓS-DEPLOY

- [ ] Site principal acessível: `https://virtualcardapio.com.br`
- [ ] Redirect www funciona: `www.virtualcardapio.com.br` → `virtualcardapio.com.br`
- [ ] DNS resolve corretamente
- [ ] Nameservers corretos (ns1.vercel-dns.com, ns2.vercel-dns.com)
- [ ] SSL/HTTPS funcionando
- [ ] API endpoints funcionando: `/api/health`

### 5. EM CASO DE ERRO - ROLLBACK IMEDIATO

```bash
# 1. Restaurar backup
cp vercel.json.backup vercel.json
cp next.config.js.backup next.config.js

# 2. Redeploy imediato
vercel --prod

# 3. Verificar se voltou ao normal
curl -I https://virtualcardapio.com.br
```

## 🚨 REGRAS DE OURO

1. **NUNCA** faça deploy sem testar localmente primeiro
2. **SEMPRE** verifique o site após o deploy
3. **JAMAIS** altere arquivos de configuração de domínio sem backup
4. **SEMPRE** tenha um plano de rollback pronto
5. **NUNCA** ignore erros de DNS - resolva imediatamente

## 📋 SCRIPT DE VERIFICAÇÃO AUTOMÁTICA

Criar arquivo `scripts/verify-deploy.sh`:

```bash
#!/bin/bash
echo "🔍 Verificando deploy..."

# Aguardar propagação
sleep 120

# Verificar site principal
if curl -f -s https://virtualcardapio.com.br > /dev/null; then
    echo "✅ Site principal OK"
else
    echo "❌ ERRO: Site principal não acessível!"
    exit 1
fi

# Verificar redirect www
if curl -s -I https://www.virtualcardapio.com.br | grep -q "301\|302"; then
    echo "✅ Redirect www OK"
else
    echo "❌ ERRO: Redirect www não funciona!"
    exit 1
fi

# Verificar DNS
if nslookup virtualcardapio.com.br > /dev/null; then
    echo "✅ DNS OK"
else
    echo "❌ ERRO: DNS não resolve!"
    exit 1
fi

echo "🎉 Deploy verificado com sucesso!"
```

## 📞 CONTATOS DE EMERGÊNCIA

Em caso de problema crítico:
- Hostinger Support: Painel de controle
- Vercel Support: Dashboard Vercel
- Backup DNS: Configurações salvas em `CONFIGURACAO-DNS-HOSTINGER.md`

---

**⚠️ IMPORTANTE:** Este protocolo deve ser seguido RELIGIOSAMENTE para evitar problemas futuros com o domínio.