@echo off
chcp 65001 >nul
title OnPedido - Servidor Local

echo.
echo 🚀 Iniciando OnPedido - Servidor Local
echo =====================================
echo.

REM Verificar se estamos no diretório correto
if not exist "package.json" (
    echo ❌ Erro: Execute este script na raiz do projeto!
    pause
    exit /b 1
)

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Erro: Node.js não encontrado! Instale o Node.js primeiro.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js detectado: %%i
)

REM Verificar dependências
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    call npm install
    if errorlevel 1 (
        echo ❌ Erro ao instalar dependências!
        pause
        exit /b 1
    )
)

REM Verificar arquivo .env
if not exist ".env" (
    echo ⚙️ Criando arquivo .env...
    copy ".env.example" ".env" >nul 2>&1
    
    echo # Database ^(SQLite para desenvolvimento local^) > .env
    echo DATABASE_URL="file:./dev.db" >> .env
    echo. >> .env
    echo # NextAuth ^(local^) >> .env
    echo NEXTAUTH_URL="http://localhost:3001" >> .env
    echo NEXTAUTH_SECRET="33cbd296f38c21eb822a6645a922fe43926e458712cccf22927ce16fc7f6fe1" >> .env
    echo. >> .env
    echo # AWS Configuration ^(opcional para desenvolvimento^) >> .env
    echo AWS_PROFILE=default >> .env
    echo AWS_REGION=us-west-2 >> .env
    echo AWS_BUCKET_NAME=menu-digital-uploads >> .env
    echo AWS_FOLDER_PREFIX=uploads/ >> .env
    
    echo ✅ Arquivo .env configurado para SQLite local
)

REM Configurar Prisma
echo 🔧 Verificando configuração do Prisma...
call npx prisma generate
if errorlevel 1 (
    echo ❌ Erro ao gerar Prisma Client!
    pause
    exit /b 1
)

call npx prisma db push --accept-data-loss
if errorlevel 1 (
    echo ❌ Erro ao aplicar migrações!
    pause
    exit /b 1
)

REM Criar usuário admin
echo 👤 Verificando usuário admin...
call npx tsx scripts/restore-admin.ts
if errorlevel 1 (
    echo ⚠️ Aviso: Erro ao criar usuário admin ^(pode já existir^)
)

REM Verificar porta 3001
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001"') do (
    echo ⚠️ Finalizando processo na porta 3001: %%a
    taskkill /PID %%a /F >nul 2>&1
)

REM Aguardar
timeout /t 2 /nobreak >nul

echo.
echo 🚀 Iniciando servidor de desenvolvimento...
echo 📍 URL: http://localhost:3001
echo 👤 Admin: michaeldouglasqueiroz@gmail.com
echo 🔑 Senha: admin123
echo.
echo Pressione Ctrl+C para parar o servidor
echo =====================================
echo.

REM Iniciar servidor
call npm run dev