# Script para configurar screenshots na landing page

Write-Host "📸 CONFIGURANDO SCREENSHOTS..." -ForegroundColor Cyan

# 1. Criar pasta screenshots
Write-Host "`n1️⃣ Criando pasta public/screenshots..." -ForegroundColor Yellow
$screenshotsPath = "public\screenshots"
if (-not (Test-Path $screenshotsPath)) {
    New-Item -ItemType Directory -Force -Path $screenshotsPath | Out-Null
    Write-Host "✅ Pasta criada: $screenshotsPath" -ForegroundColor Green
} else {
    Write-Host "✅ Pasta já existe: $screenshotsPath" -ForegroundColor Green
}

# 2. Verificar se as imagens existem
Write-Host "`n2️⃣ Verificando imagens necessárias..." -ForegroundColor Yellow
$requiredImages = @(
    "admin-dashboard.png",
    "admin-relatorios.png", 
    "admin-produtos.png",
    "admin-mesas.png",
    "admin-upsell.png",
    "admin-comandas.png",
    "cliente-pagamento.png",
    "cliente-pedido.png"
)

$missingImages = @()
foreach ($image in $requiredImages) {
    $imagePath = Join-Path $screenshotsPath $image
    if (Test-Path $imagePath) {
        Write-Host "✅ $image" -ForegroundColor Green
    } else {
        Write-Host "❌ $image (FALTANDO)" -ForegroundColor Red
        $missingImages += $image
    }
}

# 3. Instruções se faltarem imagens
if ($missingImages.Count -gt 0) {
    Write-Host "`n⚠️  FALTAM $($missingImages.Count) IMAGENS!" -ForegroundColor Red
    Write-Host "`n📋 VOCÊ PRECISA COPIAR MANUALMENTE:" -ForegroundColor Yellow
    Write-Host "`nDos screenshots que você tirou, copie para public\screenshots\:" -ForegroundColor White
    Write-Host ""
    Write-Host "Screenshot 1 (Dashboard)     → admin-dashboard.png" -ForegroundColor Cyan
    Write-Host "Screenshot 11 (Relatórios)   → admin-relatorios.png" -ForegroundColor Cyan
    Write-Host "Screenshot 3 (Produtos)      → admin-produtos.png" -ForegroundColor Cyan
    Write-Host "Screenshot 4 (Mesas)         → admin-mesas.png" -ForegroundColor Cyan
    Write-Host "Screenshot 5 (Upsell)        → admin-upsell.png" -ForegroundColor Cyan
    Write-Host "Screenshot 7 (Comandas)      → admin-comandas.png" -ForegroundColor Cyan
    Write-Host "Screenshot 9 (Pagamento)     → cliente-pagamento.png" -ForegroundColor Cyan
    Write-Host "Screenshot 10 (Pedido)       → cliente-pedido.png" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 DICA: Arraste as imagens do celular para o PC e renomeie!" -ForegroundColor Yellow
} else {
    Write-Host "`n✅ TODAS AS IMAGENS ESTÃO PRONTAS!" -ForegroundColor Green
    Write-Host "`n🚀 PRÓXIMO PASSO: Fazer deploy" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "git add ." -ForegroundColor White
    Write-Host "git commit -m `"feat: adicionar screenshots na landing page`"" -ForegroundColor White
    Write-Host "git push origin master" -ForegroundColor White
}

Write-Host "`n✨ Script concluído!" -ForegroundColor Green
