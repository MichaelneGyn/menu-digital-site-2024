# Script para corrigir problemas do Prisma no Windows

Write-Host "Parando processos Node.js..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "Aguardando 2 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Write-Host "Removendo cache do Prisma..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

Write-Host "Aguardando 2 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Write-Host "Gerando Prisma Client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "Concluído!" -ForegroundColor Green
