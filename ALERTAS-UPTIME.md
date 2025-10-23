# 🚨 Configuração de Alertas - Uptime/Downtime

## 📊 FERRAMENTAS RECOMENDADAS (GRATUITAS)

### 1. UptimeRobot (RECOMENDADO)
**Link:** https://uptimerobot.com

**Configuração:**
1. Criar conta gratuita
2. Adicionar monitor:
   - **URL:** `https://virtualcardapio.com.br`
   - **Tipo:** HTTP(s)
   - **Intervalo:** 5 minutos
   - **Alertas:** Email + SMS (se disponível)

**Alertas configurar:**
- ✅ Site fora do ar (downtime)
- ✅ Site voltou ao ar (uptime)
- ✅ Tempo de resposta alto (>5s)

### 2. Pingdom (Alternativa)
**Link:** https://www.pingdom.com

**Configuração similar ao UptimeRobot**

### 3. StatusCake (Alternativa)
**Link:** https://www.statuscake.com

## 🔧 CONFIGURAÇÃO MANUAL (SCRIPT)

### Script de Monitoramento Local
Criar arquivo: `monitor-site.ps1`

```powershell
# Monitor virtualcardapio.com.br
$url = "https://virtualcardapio.com.br"
$email = "seu-email@gmail.com"

while ($true) {
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "$(Get-Date): Site OK - Status $($response.StatusCode)"
        } else {
            Write-Host "$(Get-Date): PROBLEMA - Status $($response.StatusCode)"
            # Enviar email de alerta aqui
        }
    } catch {
        Write-Host "$(Get-Date): SITE FORA DO AR - $($_.Exception.Message)"
        # Enviar email de alerta aqui
    }
    
    Start-Sleep -Seconds 300  # Verifica a cada 5 minutos
}
```

## 📱 ALERTAS RECOMENDADOS

### Configurar alertas para:
1. **Site fora do ar** (downtime)
2. **Site lento** (>5 segundos)
3. **Erro SSL** (certificado expirado)
4. **DNS não resolve** (problema nameservers)

### Canais de alerta:
- ✅ **Email** (principal)
- ✅ **SMS** (se disponível)
- ✅ **WhatsApp** (via integração)
- ✅ **Slack/Discord** (se usar)

## 🎯 MÉTRICAS IMPORTANTES

### Monitorar:
- **Uptime:** Deve ser >99.9%
- **Tempo resposta:** <3 segundos
- **SSL:** Válido e não expirado
- **DNS:** Resolvendo corretamente

### Locais de teste:
- Brasil (São Paulo)
- EUA (se tiver clientes internacionais)
- Europa (se tiver clientes internacionais)

## 🚨 AÇÃO IMEDIATA AO RECEBER ALERTA

### 1. Verificar se é problema real:
```bash
curl -I https://virtualcardapio.com.br
```

### 2. Se site estiver fora do ar:
1. Verificar DNS: `nslookup virtualcardapio.com.br`
2. Verificar Vercel status: https://vercel.com/status
3. Verificar Hostinger (se DNS estiver errado)

### 3. Comunicação:
- Informar clientes se necessário
- Documentar o problema
- Implementar correção

## 📋 CHECKLIST DE CONFIGURAÇÃO

```
✅ [ ] UptimeRobot configurado
✅ [ ] Email de alerta funcionando
✅ [ ] Teste de alerta realizado
✅ [ ] Documentação de procedimentos criada
✅ [ ] Contatos de emergência definidos
```

## 📞 CONTATOS DE EMERGÊNCIA

### Hostinger:
- Suporte: Chat no painel
- Status: https://www.hostinger.com.br/status

### Vercel:
- Status: https://vercel.com/status
- Docs: https://vercel.com/docs

### Cloudinary (imagens):
- Status: https://status.cloudinary.com

## 🔄 BACKUP SEMPRE DISPONÍVEL
**URL Vercel (sempre funciona):**
https://menu-digital-site-2024-8773d37d606448f665f364adadb0de35da0262ad.vercel.app