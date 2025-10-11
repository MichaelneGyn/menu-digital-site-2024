# Script para inicializar o servidor local OnPedido
# Versao simplificada sem emojis

Write-Host "Iniciando OnPedido - Servidor Local" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Verificar se estamos no diretorio correto
if (-not (Test-Path "package.json")) {
    Write-Host "ERRO: Execute este script na raiz do projeto!" -ForegroundColor Red
    exit 1
}

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Node.js nao encontrado! Instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Instalar dependencias se necessario
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRO ao instalar dependencias!" -ForegroundColor Red
        exit 1
    }
}

# Configurar .env se nao existir
if (-not (Test-Path ".env")) {
    Write-Host "Criando arquivo .env..." -ForegroundColor Yellow
    
    $envContent = 'DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="33cbd296f38c21eb822a6645a922fe43926e458712cccf22927ce16fc7f6fe1"
AWS_PROFILE=default
AWS_REGION=us-west-2
AWS_BUCKET_NAME=menu-digital-uploads
AWS_FOLDER_PREFIX=uploads/'
    
    Set-Content -Path ".env" -Value $envContent -Encoding UTF8
    Write-Host "Arquivo .env configurado para SQLite local" -ForegroundColor Green
}

# Configurar Prisma
Write-Host "Configurando Prisma..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO ao gerar Prisma Client!" -ForegroundColor Red
    exit 1
}

npx prisma db push --accept-data-loss
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO ao aplicar migracoes!" -ForegroundColor Red
    exit 1
}

# Criar usuario admin
Write-Host "Criando usuario admin..." -ForegroundColor Yellow
npx tsx scripts/restore-admin.ts

# Verificar porta 3001
$portInUse = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "Liberando porta 3001..." -ForegroundColor Yellow
    
    $processes = netstat -ano | Select-String ":3001" | ForEach-Object {
        $line = $_.Line.Trim() -split '\s+'
        if ($line.Length -ge 5) {
            $line[4]
        }
    } | Sort-Object -Unique
    
    foreach ($pid in $processes) {
        if ($pid -and $pid -ne "0") {
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-Host "Processo $pid finalizado" -ForegroundColor Green
            } catch {
                Write-Host "Nao foi possivel finalizar processo $pid" -ForegroundColor Yellow
            }
        }
    }
    
    Start-Sleep -Seconds 2
}

# Iniciar servidor
Write-Host ""
Write-Host "Iniciando servidor de desenvolvimento..." -ForegroundColor Green
Write-Host "URL: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Admin: michaeldouglasqueiroz@gmail.com" -ForegroundColor Cyan
Write-Host "Senha: admin123" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Green

npm run dev