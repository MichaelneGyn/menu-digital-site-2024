const https = require('https');

// URL do último deployment
const BASE_URL = 'https://menu-digital-site-2024-8773d37d606448f665f364adadb0d-g0f2w3qs3.vercel.app';

function makeRequest(url, expectedStatus = 200) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.get(url, { timeout: 15000 }, (res) => {
      const duration = Date.now() - startTime;
      const success = expectedStatus === res.statusCode;
      
      console.log(`${success ? '✅' : '❌'} ${url}`);
      console.log(`   Status: ${res.statusCode} (esperado: ${expectedStatus})`);
      console.log(`   Tempo: ${duration}ms`);
      console.log('');
      
      resolve({ success, status: res.statusCode, duration });
    });
    
    req.on('error', (err) => {
      const duration = Date.now() - startTime;
      console.log(`❌ ${url}`);
      console.log(`   Erro: ${err.message}`);
      console.log(`   Tempo: ${duration}ms`);
      console.log('');
      
      resolve({ success: false, error: err.message, duration });
    });
    
    req.on('timeout', () => {
      req.destroy();
      const duration = Date.now() - startTime;
      console.log(`⏰ ${url}`);
      console.log(`   Timeout após ${duration}ms`);
      console.log('');
      
      resolve({ success: false, error: 'Timeout', duration });
    });
  });
}

async function testLatestDeployment() {
  console.log('🚀 TESTANDO ÚLTIMA VERSÃO DE PRODUÇÃO');
  console.log('=====================================');
  console.log(`URL Base: ${BASE_URL}`);
  console.log('');
  
  const tests = [
    { name: 'Página Principal', url: `${BASE_URL}/`, expected: 200 },
    { name: 'Health Check', url: `${BASE_URL}/api/health`, expected: 200 },
    { name: 'Upload Endpoint', url: `${BASE_URL}/api/upload`, expected: 400 }, // 400 sem arquivo é esperado
    { name: 'Menu Público', url: `${BASE_URL}/api/menu`, expected: 200 },
    { name: 'Restaurantes Públicos', url: `${BASE_URL}/api/restaurants`, expected: 200 },
    { name: 'Admin Dashboard', url: `${BASE_URL}/admin`, expected: 401 }, // 401 sem login é esperado
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`Testando: ${test.name}`);
    const result = await makeRequest(test.url, test.expected);
    
    if (result.success) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('=====================================');
  console.log('📊 RESUMO DOS TESTES');
  console.log(`✅ Passou: ${passed}`);
  console.log(`❌ Falhou: ${failed}`);
  
  if (failed === 0) {
    console.log('🎉 TODOS OS TESTES PASSARAM! O middleware foi corrigido com sucesso.');
    console.log('');
    console.log('🔗 URL DE PRODUÇÃO FUNCIONANDO:');
    console.log(`   ${BASE_URL}`);
  } else {
    console.log('🚨 ALGUNS TESTES FALHARAM! Verifique os problemas acima.');
  }
}

testLatestDeployment().catch(console.error);