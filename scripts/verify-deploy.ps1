# Script de Verificacao Pos-Deploy
# virtualcardapio.com.br

Write-Host "Iniciando verificacao pos-deploy..." -ForegroundColor Yellow

# Aguardar propagacao DNS
Write-Host "Aguardando propagacao DNS (2 minutos)..." -ForegroundColor Blue
Start-Sleep -Seconds 120

# Array para armazenar erros
$errors = @()

# Verificar site principal
Write-Host "Verificando site principal..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "https://virtualcardapio.com.br" -Method Head -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host "Site principal OK (Status: $($response.StatusCode))" -ForegroundColor Green
    } else {
        $errors += "Site principal retornou status: $($response.StatusCode)"
    }
} catch {
    $errors += "ERRO: Site principal nao acessivel - $($_.Exception.Message)"
}

# Verificar redirect www
Write-Host "Verificando redirect www..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "https://www.virtualcardapio.com.br" -Method Head -MaximumRedirection 0 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 301 -or $response.StatusCode -eq 302) {
        Write-Host "Redirect www OK (Status: $($response.StatusCode))" -ForegroundColor Green
    } else {
        $errors += "Redirect www nao funciona (Status: $($response.StatusCode))"
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 301 -or $_.Exception.Response.StatusCode -eq 302) {
        Write-Host "Redirect www OK" -ForegroundColor Green
    } else {
        $errors += "ERRO: Redirect www nao funciona - $($_.Exception.Message)"
    }
}

# Verificar paginas principais
$pages = @(
    "/",
    "/cardapio",
    "/sobre",
    "/contato"
)

Write-Host "Verificando paginas principais..." -ForegroundColor Blue
foreach ($page in $pages) {
    try {
        $response = Invoke-WebRequest -Uri "https://virtualcardapio.com.br$page" -Method Head -TimeoutSec 30
        if ($response.StatusCode -eq 200) {
            Write-Host "Pagina $page OK" -ForegroundColor Green
        } else {
            $errors += "Pagina $page retornou status: $($response.StatusCode)"
        }
    } catch {
        $errors += "ERRO: Pagina $page nao acessivel - $($_.Exception.Message)"
    }
}

# Verificar SSL
Write-Host "Verificando certificado SSL..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "https://virtualcardapio.com.br" -Method Head -TimeoutSec 30
    Write-Host "Certificado SSL OK" -ForegroundColor Green
} catch {
    $errors += "ERRO: Problema com certificado SSL - $($_.Exception.Message)"
}

# Relatorio final
Write-Host "`n=== RELATORIO FINAL ===" -ForegroundColor Yellow
if ($errors.Count -eq 0) {
    Write-Host "SUCESSO: Deploy verificado com sucesso!" -ForegroundColor Green
    Write-Host "Site disponivel em: https://virtualcardapio.com.br" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "ATENCAO: Encontrados $($errors.Count) problemas:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "- $error" -ForegroundColor Red
    }
    exit 1
}