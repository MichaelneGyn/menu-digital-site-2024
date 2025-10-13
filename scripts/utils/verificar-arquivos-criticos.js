/**
 * Script para verificar se arquivos críticos existem
 * Execute antes de fazer deploy: node scripts/utils/verificar-arquivos-criticos.js
 */

const fs = require('fs');
const path = require('path');

const ARQUIVOS_CRITICOS = [
  // Rotas principais
  'app/page.tsx',
  'app/layout.tsx',
  'app/[slug]/page.tsx',
  
  // Auth
  'app/auth/login/page.tsx',
  'app/api/auth/[...nextauth]/route.ts',
  'lib/auth.ts',
  
  // Dashboard
  'app/admin/dashboard/page.tsx',
  'app/dashboard/page.tsx',
  
  // APIs críticas
  'app/api/orders/create/route.ts',
  'app/api/upload/route.ts',
  'app/api/restaurant/route.ts',
  
  // Lib
  'lib/db.ts',
  'lib/restaurant.ts',
  
  // Componentes principais
  'components/menu/menu-page.tsx',
  
  // Config
  'next.config.js',
  'prisma/schema.prisma',
  '.gitignore',
];

console.log('🔍 Verificando arquivos críticos...\n');

let erros = 0;
let avisos = 0;

ARQUIVOS_CRITICOS.forEach(arquivo => {
  const caminhoCompleto = path.join(process.cwd(), arquivo);
  
  if (!fs.existsSync(caminhoCompleto)) {
    console.error(`❌ ERRO: Arquivo faltando: ${arquivo}`);
    erros++;
  } else {
    const stats = fs.statSync(caminhoCompleto);
    if (stats.size === 0) {
      console.warn(`⚠️  AVISO: Arquivo vazio: ${arquivo}`);
      avisos++;
    } else {
      console.log(`✅ OK: ${arquivo}`);
    }
  }
});

console.log('\n' + '='.repeat(50));
console.log(`📊 Resultado:`);
console.log(`   ✅ Arquivos OK: ${ARQUIVOS_CRITICOS.length - erros - avisos}`);
console.log(`   ⚠️  Avisos: ${avisos}`);
console.log(`   ❌ Erros: ${erros}`);
console.log('='.repeat(50) + '\n');

if (erros > 0) {
  console.error('🚨 ATENÇÃO: Arquivos críticos faltando!');
  console.error('   NÃO FAÇA DEPLOY até corrigir!\n');
  process.exit(1);
}

if (avisos > 0) {
  console.warn('⚠️  AVISO: Alguns arquivos estão vazios.');
  console.warn('   Verifique se está correto antes de fazer deploy.\n');
}

console.log('✅ Todos os arquivos críticos estão presentes!\n');
console.log('💡 Próximo passo: Execute os testes do CHECKLIST_POS_DEPLOY.md\n');
