# Script de Organização do Projeto
# Remove arquivos desnecessários e organiza documentação

Write-Host "🧹 Iniciando organização do projeto..." -ForegroundColor Cyan

# Criar pasta para arquivos informativos
$docsArchive = "docs-archive"
if (-not (Test-Path $docsArchive)) {
    New-Item -ItemType Directory -Path $docsArchive | Out-Null
    Write-Host "✅ Pasta $docsArchive criada" -ForegroundColor Green
}

# Arquivos .md informativos para mover (manter apenas README.md)
$mdFilesToMove = @(
    "ACAO-IMEDIATA.md",
    "ANALISE-*.md",
    "ANUNCIO-MERCADO-LIVRE.md",
    "BARRA-CATEGORIAS-ANIMADA.md",
    "BLUR-DADOS-PESSOAIS.md",
    "BOTTOM-NAV-IMPLEMENTADO.md",
    "CARRINHO-COMPACTO-PILL.md",
    "CART-FLOAT-OTIMIZADO.md",
    "CEP-AUTOMATICO-CORRIGIDO.md",
    "COLA_NO_BLOCO_DE_NOTAS.txt",
    "COMANDOS_RAPIDOS.md",
    "COMO-*.md",
    "COMPARATIVO-BRENDI.md",
    "CONFIGURAR-*.md",
    "CONVERSAO-BASEADA-EM-DADOS.md",
    "CORRECAO-*.md",
    "CORRECOES-*.md",
    "CORRIGIR-*.md",
    "CSP-CORS-CORRIGIDO.md",
    "DEPLOY-*.md",
    "DEPOIMENTOS-ESTILO-WHATSAPP.md",
    "DIAGNOSTICO-STICKY.md",
    "ESTRATEGIA-*.md",
    "FONTES-TAXAS-IFOOD.md",
    "GALERIA-LOGOS.md",
    "GERENCIAR-USUARIOS.md",
    "GOOGLE-ANALYTICS-SETUP.md",
    "GUIA-*.md",
    "IDENTIDADE-VISUAL-PERSONALIZAVEL.md",
    "IGNORAR-WARNINGS-CSS.md",
    "IMPLEMENTACAO-*.md",
    "IMPLEMENTADO-*.md",
    "INSTRUCOES-*.md",
    "INTEGRACAO-*.md",
    "LIMPEZA-HISTORICO-COMPLETA.md",
    "MELHORIA-*.md",
    "MELHORIAS-*.md",
    "MENU-STICKY-*.md",
    "MUDANCAS-IMPLEMENTADAS.md",
    "NOMES-DISPONIVEIS.md",
    "NOVOS-PLANOS-PRECOS.md",
    "OTIMIZACOES-*.md",
    "PAGINA-PEDIDOS-CRIADA.md",
    "PASSO-A-PASSO-*.md",
    "PEDIDOS-SEM-MOCK.md",
    "PERSONALIZACAO-*.md",
    "PLANO_ORGANIZACAO.md",
    "PRECIFICACAO-ESTRATEGICA.md",
    "PRECO-*.md",
    "PRICING-ESTRATEGIA-FINAL.md",
    "PROBLEMA-MENU-STICKY-RESOLVIDO.md",
    "RECURSOS-COMPLETOS.md",
    "RELATORIOS-LUCRO-IMPLEMENTACAO.md",
    "REMOCAO-BLACK-FRIDAY.md",
    "RESUMO-*.md",
    "SCRIPT-VENDAS-COMPLETO.md",
    "SECURITY-*.md",
    "SELETOR-IDIOMA-ADICIONADO.md",
    "SEO-OTIMIZACAO-COMPLETA.md",
    "SISTEMA-*.md",
    "SOLUCAO-*.md",
    "STICKY-JA-IMPLEMENTADO.md",
    "TESTE-*.md",
    "TROUBLESHOOTING-EMAIL.md",
    "UPSELL-*.md"
)

Write-Host "`n📄 Movendo arquivos .md informativos..." -ForegroundColor Yellow
$movedCount = 0
foreach ($pattern in $mdFilesToMove) {
    $files = Get-ChildItem -Path . -Filter $pattern -File -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        Move-Item -Path $file.FullName -Destination $docsArchive -Force
        $movedCount++
    }
}
Write-Host "✅ $movedCount arquivos .md movidos para $docsArchive" -ForegroundColor Green

# Arquivos .sql para mover
Write-Host "`n🗄️ Movendo arquivos .sql..." -ForegroundColor Yellow
$sqlFiles = Get-ChildItem -Path . -Filter "*.sql" -File
$sqlCount = 0
foreach ($file in $sqlFiles) {
    Move-Item -Path $file.FullName -Destination $docsArchive -Force
    $sqlCount++
}
Write-Host "✅ $sqlCount arquivos .sql movidos para $docsArchive" -ForegroundColor Green

# Arquivos de teste para remover
$testFilesToRemove = @(
    "test-production-upload.js",
    "test-current-production.js",
    "test-final-fix.js",
    "test-latest-deployment.js",
    "test-middleware-fix.js",
    "test-new-deployment.js",
    "test-production-detailed.js",
    "test-security-auto.js",
    "test-security.ps1",
    "test-simple.js",
    "test-sticky-final.html",
    "test-upload-debug.js",
    "teste-sticky.html",
    "security-test.html",
    "check-rls-status.html"
)

Write-Host "`n🧪 Removendo arquivos de teste..." -ForegroundColor Yellow
$removedCount = 0
foreach ($file in $testFilesToRemove) {
    if (Test-Path $file) {
        Remove-Item -Path $file -Force
        $removedCount++
    }
}
Write-Host "✅ $removedCount arquivos de teste removidos" -ForegroundColor Green

# Arquivos diversos para remover
$miscFilesToRemove = @(
    "secrets-to-remove.txt",
    "bfg.jar",
    "middleware-old.ts",
    "next.config.js.backup",
    "vercel.json.backup",
    "add-cloudinary-env.ps1",
    "meu-ip.bat"
)

Write-Host "`n🗑️ Removendo arquivos diversos..." -ForegroundColor Yellow
$miscCount = 0
foreach ($file in $miscFilesToRemove) {
    if (Test-Path $file) {
        Remove-Item -Path $file -Force
        $miscCount++
    }
}
Write-Host "✅ $miscCount arquivos diversos removidos" -ForegroundColor Green

# Criar pasta para scripts de desenvolvimento
$devScripts = "dev-scripts"
if (-not (Test-Path $devScripts)) {
    New-Item -ItemType Directory -Path $devScripts | Out-Null
    Write-Host "`n✅ Pasta $devScripts criada" -ForegroundColor Green
}

# Mover scripts de desenvolvimento
$scriptsToMove = @(
    "start-local.bat",
    "start-local.ps1",
    "start-local-simple.ps1",
    "start-server.ps1",
    "restart-local.bat",
    "setup-screenshots.ps1"
)

Write-Host "`n📜 Movendo scripts de desenvolvimento..." -ForegroundColor Yellow
$scriptCount = 0
foreach ($file in $scriptsToMove) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination $devScripts -Force
        $scriptCount++
    }
}
Write-Host "✅ $scriptCount scripts movidos para $devScripts" -ForegroundColor Green

# Atualizar .gitignore
Write-Host "`n📝 Atualizando .gitignore..." -ForegroundColor Yellow
$gitignoreContent = @"
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/
dist/

# Production
.vercel/

# Misc
.DS_Store
*.pem
.idea/
.vscode/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Prisma
prisma/dev.db
prisma/dev.db-journal

# Supabase
.supabase/

# Archive
docs-archive/
dev-scripts/

# Temporary files
*.tmp
*.temp
"@

Set-Content -Path ".gitignore" -Value $gitignoreContent -Force
Write-Host "✅ .gitignore atualizado" -ForegroundColor Green

# Criar README.md atualizado se não existir
if (-not (Test-Path "README.md")) {
    Write-Host "`n📖 Criando README.md..." -ForegroundColor Yellow
    $readmeContent = @"
# Menu Digital - Virtual Cardápio

Sistema completo de cardápio digital para restaurantes, pizzarias e lanchonetes.

## 🚀 Tecnologias

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth
- **Upload de Imagens:** Cloudinary
- **Deploy:** Vercel

## 📦 Instalação

\`\`\`bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Rodar em desenvolvimento
npm run dev
\`\`\`

## 🌐 Deploy

O projeto está configurado para deploy automático na Vercel.

## 📁 Estrutura do Projeto

\`\`\`
/app              # Páginas e rotas Next.js
/components       # Componentes React
/lib              # Utilitários e configurações
/prisma           # Schema do banco de dados
/public           # Arquivos estáticos
/docs             # Documentação técnica
/docs-archive     # Documentação histórica (não essencial)
/dev-scripts      # Scripts de desenvolvimento
\`\`\`

## 🔧 Scripts Disponíveis

- \`npm run dev\` - Inicia servidor de desenvolvimento
- \`npm run build\` - Cria build de produção
- \`npm run start\` - Inicia servidor de produção
- \`npm run lint\` - Executa linter

## 📚 Documentação

A documentação técnica está na pasta \`/docs\`.
Documentação histórica e guias estão em \`/docs-archive\`.

## 🤝 Contribuindo

1. Faça fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Todos os direitos reservados.
"@
    Set-Content -Path "README.md" -Value $readmeContent -Force
    Write-Host "✅ README.md criado" -ForegroundColor Green
}

Write-Host "`n✨ Organização concluída!" -ForegroundColor Green
Write-Host "`n📊 Resumo:" -ForegroundColor Cyan
Write-Host "  • $movedCount arquivos .md movidos" -ForegroundColor White
Write-Host "  • $sqlCount arquivos .sql movidos" -ForegroundColor White
Write-Host "  • $removedCount arquivos de teste removidos" -ForegroundColor White
Write-Host "  • $miscCount arquivos diversos removidos" -ForegroundColor White
Write-Host "  • $scriptCount scripts organizados" -ForegroundColor White
Write-Host "`n📁 Estrutura:" -ForegroundColor Cyan
Write-Host "  • /docs-archive - Documentação histórica" -ForegroundColor White
Write-Host "  • /dev-scripts - Scripts de desenvolvimento" -ForegroundColor White
Write-Host "  • .gitignore atualizado" -ForegroundColor White
Write-Host "`n🎉 Projeto organizado com sucesso!" -ForegroundColor Green
