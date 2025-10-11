#!/usr/bin/env pwsh
# Script para inicializar o servidor local sempre funcionando
# Autor: Sistema OnPedido
# Data: $(Get-Date -Format "yyyy-MM-dd")

Write-Host "Iniciando OnPedido - Servidor Local" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Verificar se estamos no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "Erro: Execute este script na raiz do projeto!" -ForegroundColor Red
    exit 1
}

# Verificar se o Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro: Node.js não encontrado! Instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se as dependências estão instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao instalar dependências!" -ForegroundColor Red
        exit 1
    }
}

# Verificar se o arquivo .env existe
if (-not (Test-Path ".env")) {
    Write-Host "⚙️ Criando arquivo .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    
    # Configurar .env para desenvolvimento local
    $envContent = @"
# Database (SQLite para desenvolvimento local)
DATABASE_URL="file:./dev.db"

# NextAuth (local)
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="33cbd296f38c21eb822a6645a922fe43926e458712cccf22927ce16fc7f6fe1"

# AWS Configuration (opcional para desenvolvimento)
AWS_PROFILE=default
AWS_REGION=us-west-2
AWS_BUCKET_NAME=menu-digital-uploads
AWS_FOLDER_PREFIX=uploads/
"@
    
    Set-Content -Path ".env" -Value $envContent -Encoding UTF8
    Write-Host "Arquivo .env configurado para SQLite local" -ForegroundColor Green
}

# Verificar se o Prisma está configurado
Write-Host "🔧 Verificando configuração do Prisma..." -ForegroundColor Yellow

# Gerar Prisma Client
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao gerar Prisma Client!" -ForegroundColor Red
    exit 1
}

# Aplicar migrações (push para SQLite)
npx prisma db push --accept-data-loss
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao aplicar migrações!" -ForegroundColor Red
    exit 1
}

# Verificar se existe usuário admin
Write-Host "👤 Verificando usuário admin..." -ForegroundColor Yellow
npx tsx scripts/restore-admin.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Aviso: Erro ao criar usuário admin (pode já existir)" -ForegroundColor Yellow
}

# Verificar se a porta 3001 está livre
$portInUse = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "⚠️ Porta 3001 em uso. Finalizando processos..." -ForegroundColor Yellow
    
    # Encontrar e finalizar processos na porta 3001
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
                Write-Host "✅ Processo $pid finalizado" -ForegroundColor Green
            } catch {
                Write-Host "⚠️ Não foi possível finalizar processo $pid" -ForegroundColor Yellow
            }
        }
    }
    
    # Aguardar um momento
    Start-Sleep -Seconds 2
}

# Iniciar o servidor
Write-Host "🚀 Iniciando servidor de desenvolvimento..." -ForegroundColor Green
Write-Host "📍 URL: http://localhost:3001" -ForegroundColor Cyan
Write-Host "👤 Admin: michaeldouglasqueiroz@gmail.com" -ForegroundColor Cyan
Write-Host "🔑 Senha: admin123" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Green

# Executar npm run dev
npm run dev