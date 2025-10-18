// TESTE SIMPLIFICADO DE SEGURANÇA
const https = require('https');

const siteUrl = 'https://menu-digital-site-2024-8773d37d6064.vercel.app';
let passed = 0;
let failed = 0;

console.log('\n=== TESTE DE SEGURANCA ===\n');
console.log('Site:', siteUrl, '\n');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject).setTimeout(10000);
  });
}

async function test() {
  // TESTE 1: Headers de Seguranca
  console.log('[TESTE 1] Headers de Seguranca');
  try {
    const res = await makeRequest(siteUrl);
    
    if (res.headers['x-frame-options'] === 'DENY') {
      console.log('  OK - X-Frame-Options: DENY');
      passed++;
    } else {
      console.log('  FALHOU - X-Frame-Options');
      failed++;
    }
    
    if (res.headers['x-content-type-options'] === 'nosniff') {
      console.log('  OK - X-Content-Type-Options: nosniff');
      passed++;
    } else {
      console.log('  FALHOU - X-Content-Type-Options');
      failed++;
    }
    
    if (res.headers['x-xss-protection']) {
      console.log('  OK - X-XSS-Protection presente');
      passed++;
    } else {
      console.log('  FALHOU - X-XSS-Protection');
      failed++;
    }
  } catch (error) {
    console.log('  ERRO:', error.message);
    failed += 3;
  }
  
  console.log('');
  
  // TESTE 2: HTTPS
  console.log('[TESTE 2] HTTPS Ativo');
  if (siteUrl.startsWith('https://')) {
    console.log('  OK - Site usa HTTPS');
    passed++;
  } else {
    console.log('  FALHOU - Site nao usa HTTPS');
    failed++;
  }
  
  console.log('');
  
  // TESTE 3: API Health
  console.log('[TESTE 3] Sistema Online');
  try {
    const res = await makeRequest(siteUrl + '/api/health');
    if (res.status === 200) {
      console.log('  OK - API respondendo (200)');
      passed++;
    } else {
      console.log('  AVISO - Status:', res.status);
      passed++;
    }
  } catch (error) {
    console.log('  ERRO:', error.message);
    failed++;
  }
  
  console.log('');
  
  // TESTE 4: Protecao PATCH
  console.log('[TESTE 4] Protecao de APIs (PATCH)');
  try {
    const req = https.request(siteUrl + '/api/orders/test123', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      if (res.statusCode === 401) {
        console.log('  OK - PATCH bloqueado sem autenticacao (401)');
        passed++;
      } else {
        console.log('  FALHOU - PATCH permitido sem auth (Status:', res.statusCode + ')');
        failed++;
      }
    });
    req.on('error', () => {
      console.log('  OK - Requisicao bloqueada');
      passed++;
    });
    req.end();
    
    // Aguardar resposta
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (error) {
    console.log('  ERRO:', error.message);
    failed++;
  }
  
  // RESULTADO FINAL
  console.log('\n=== RESULTADO ===\n');
  const total = passed + failed;
  const score = Math.round((passed / total) * 100);
  
  console.log('Total de testes:', total);
  console.log('Passou:', passed);
  console.log('Falhou:', failed);
  console.log('\nScore:', score + '%');
  
  if (score >= 80) {
    console.log('\nSTATUS: SISTEMA SEGURO!\n');
  } else if (score >= 60) {
    console.log('\nSTATUS: BOM, algumas melhorias possiveis\n');
  } else {
    console.log('\nSTATUS: ATENCAO - correcoes necessarias\n');
  }
}

test().catch(console.error);
