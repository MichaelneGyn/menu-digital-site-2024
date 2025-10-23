# Monitoramento de Domínio - virtualcardapio.com.br

## ⚠️ CONFIGURAÇÕES CRÍTICAS - NUNCA ALTERAR

### Nameservers Corretos (Vercel)
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

### IPs Esperados do Vercel
```
76.76.21.142
76.76.21.21
76.76.21.164
76.76.21.241
```

## 🔍 Verificações Diárias Automáticas

### 1. Comando para verificar nameservers:
```bash
nslookup -type=NS virtualcardapio.com.br
```
**Resultado esperado**: Deve mostrar `ns1.vercel-dns.com` e `ns2.vercel-dns.com`

### 2. Comando para verificar IPs:
```bash
nslookup virtualcardapio.com.br
```
**Resultado esperado**: Deve mostrar IPs do Vercel (76.76.21.x)

### 3. Teste de conectividade:
```bash
curl -I https://virtualcardapio.com.br
```
**Resultado esperado**: Status 200 OK

## 🚨 ALERTAS DE EMERGÊNCIA

### Se os nameservers mudarem:
1. **IMEDIATAMENTE** acessar Hostinger
2. Ir em "Gerenciar DNS"
3. Alterar para nameservers Vercel:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
4. Aguardar propagação (15min-24h)

### Se o site ficar fora do ar:
1. Verificar se é problema de DNS (usar comandos acima)
2. Verificar status do Vercel: https://vercel.com/status
3. Se DNS estiver errado, corrigir imediatamente

## 📋 CHECKLIST PÓS-DEPLOY

- [ ] Site acessível via https://virtualcardapio.com.br
- [ ] Nameservers corretos (Vercel)
- [ ] IPs resolvendo para Vercel
- [ ] SSL funcionando
- [ ] Todas as páginas carregando

## 🔧 Ferramentas de Monitoramento Recomendadas

1. **UptimeRobot** (gratuito) - monitora se site está no ar
2. **Pingdom** - monitora performance
3. **DNS Checker** - verifica propagação DNS global

## ⚡ AÇÃO IMEDIATA EM CASO DE PROBLEMA

1. **NÃO ENTRE EM PÂNICO**
2. Verifique DNS primeiro
3. Se DNS estiver errado, corrija na Hostinger
4. Site volta ao ar em 15min-24h após correção
5. Vercel URL sempre funciona: https://menu-digital-site-2024-8773d37d606448f665f364adadb0de35da0262ad.vercel.app