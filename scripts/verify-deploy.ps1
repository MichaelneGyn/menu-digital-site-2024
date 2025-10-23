# Script de Verificação Pós-Deploy
# virtualcardapio.com.br

Write-Host "🔍 Iniciando verificação pós-deploy..." -ForegroundColor Yellow

# Aguardar propagação DNS
Write-Host "⏳ Aguardando propagação DNS (2 minutos)..." -ForegroundColor Blue
Start-Sleep -Seconds 120

$errors = @()

# Verificar site principal
Write-Host "🌐 Verificando site principal..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "https://virtualcardapio.com.br" -Method Head -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Site principal OK (Status: $($response.StatusCode))" -ForegroundColor Green
    } else {
        $errors += "❌ Site principal retornou status: $($response.StatusCode)"
    }
} catch {
    $errors += "❌ ERRO: Site principal não acessível - $($_.Exception.Message)"
}

# Verificar redirect www
Write-Host "🔄 Verificando redirect www..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "https://www.virtualcardapio.com.br" -Method Head -MaximumRedirection 0 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 301 -or $response.StatusCode -eq 302) {
        Write-Host "✅ Redirect www OK (Status: $($response.StatusCode))" -ForegroundColor Green
    } else {
        $errors += "❌ Redirect www não funciona (Status: $($response.StatusCode))"
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 301 -or $_.Exception.Response.StatusCode -eq 302) {
        Write-Host "✅ Redirect www OK" -ForegroundColor Green
    } else {
        $errors += "❌ ERRO: Redirect www não funciona - $($_.Exception.Message)"
    }
}

# Verificar DNS
Write-Host "🔍 Verificando DNS..." -ForegroundColor Blue
try {
    $dnsResult = Resolve-DnsName -Name "virtualcardapio.com.br" -Type A -ErrorAction Stop
    if ($dnsResult) {
        Write-Host "✅ DNS resolve OK (IP: $($dnsResult[0].IPAddress))" -ForegroundColor Green
    } else {
        $errors += "❌ DNS não resolve"
    }
} catch {
    $errors += "❌ ERRO: DNS não resolve - $($_.Exception.Message)"
}

# Verificar nameservers
Write-Host "🌐 Verificando nameservers..." -ForegroundColor Blue
try {
    $nsResult = Resolve-DnsName -Name "virtualcardapio.com.br" -Type NS -ErrorAction Stop
    $vercelNS = $nsResult | Where-Object { $_.NameHost -like "*vercel-dns.com" }
    if ($vercelNS.Count -ge 2) {
        Write-Host "✅ Nameservers Vercel OK" -ForegroundColor Green
    } else {
        $errors += "❌ Nameservers não são da Vercel"
    }
} catch {
    $errors += "❌ ERRO: Não foi possível verificar nameservers - $($_.Exception.Message)"
}

# Verificar API health
Write-Host "🏥 Verificando API health..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "https://virtualcardapio.com.br/api/health" -Method Get -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API health OK" -ForegroundColor Green
    } else {
        $errors += "❌ API health retornou status: $($response.StatusCode)"
    }
} catch {
    $errors += "❌ ERRO: API health não acessível - $($_.Exception.Message)"
}

# Resultado final
Write-Host "`n" -NoNewline
if ($errors.Count -eq 0) {
    Write-Host "🎉 DEPLOY VERIFICADO COM SUCESSO!" -ForegroundColor Green -BackgroundColor Black
    Write-Host "✅ Todos os testes passaram" -ForegroundColor Green
    exit 0
} else {
    Write-Host "🚨 PROBLEMAS ENCONTRADOS NO DEPLOY!" -ForegroundColor Red -BackgroundColor Black
    Write-Host "❌ Erros encontrados:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "   $error" -ForegroundColor Red
    }
    Write-Host "`n⚠️  AÇÃO NECESSÁRIA: Verificar e corrigir os problemas acima" -ForegroundColor Yellow
    exit 1
}