# Para todos os processos Node
Write-Host "Parando todos os processos Node.js..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Aguarda 3 segundos
Write-Host "Aguardando 3 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Inicia o servidor
Write-Host "Iniciando servidor na porta 3001..." -ForegroundColor Green
npm run dev
