const https = require('https');

const NEW_PRODUCTION_URL = 'https://menu-digital-site-2024-8773d37d606448f665f364adadb0d-f5iokyrlh.vercel.app';

console.log('🔧 TESTANDO CORREÇÃO DO MIDDLEWARE');
console.log('==================================');
console.log(`Nova URL: ${NEW_PRODUCTION_URL}`);
console.log('');

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 8000,
      ...options
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          ok: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testEndpoint(name, endpoint, expectedStatus = 200) {
  const url = `${NEW_PRODUCTION_URL}${endpoint}`;
  console.log(`🧪 ${name}`);
  console.log(`   URL: ${endpoint}`);
  
  try {
    const response = await makeRequest(url);
    const status = response.status === expectedStatus ? '✅ OK' : '❌ Problema';
    
    console.log(`   📊 Status: ${response.status} (esperado: ${expectedStatus})`);
    console.log(`   🎯 Resultado: ${status}`);
    
    if (response.data && response.data.length < 500) {
      try {
        const json = JSON.parse(response.data);
        console.log(`   📄 Resposta: ${JSON.stringify(json, null, 2)}`);
      } catch {
        console.log(`   📄 Resposta: ${response.data.substring(0, 100)}...`);
      }
    }
    
    return response.status === expectedStatus;
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    console.log(`   🎯 Resultado: ❌ Falhou`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Testando endpoints após correção do middleware...\n');

  const results = [];

  // 1. Health Check - deve funcionar agora (200)
  results.push(await testEndpoint('Health Check', '/api/health', 200));
  console.log('');

  // 2. Upload Endpoint - deve dar 400 (sem arquivo) em vez de 401
  results.push(await testEndpoint('Upload Endpoint (sem arquivo)', '/api/upload', 400));
  console.log('');

  // 3. Menu público - deve funcionar (200)
  results.push(await testEndpoint('Menu Público', '/api/menu', 200));
  console.log('');

  // 4. Restaurantes públicos - deve funcionar (200)
  results.push(await testEndpoint('Restaurantes Públicos', '/api/restaurants', 200));
  console.log('');

  // 5. Admin (deve continuar protegido - 401)
  results.push(await testEndpoint('Admin Dashboard (protegido)', '/admin/dashboard', 401));
  console.log('');

  const successCount = results.filter(r => r).length;
  const totalTests = results.length;

  console.log('📋 RESUMO DOS TESTES:');
  console.log('====================');
  console.log(`✅ Sucessos: ${successCount}/${totalTests}`);
  console.log(`❌ Falhas: ${totalTests - successCount}/${totalTests}`);
  
  if (successCount === totalTests) {
    console.log('\n🎉 MIDDLEWARE CORRIGIDO COM SUCESSO!');
    console.log('✅ Todos os endpoints estão funcionando corretamente');
    console.log('✅ Upload deve estar funcionando agora');
    console.log('✅ Health check está acessível');
    console.log('✅ APIs públicas estão funcionando');
    console.log('✅ Admin continua protegido');
  } else {
    console.log('\n⚠️ Alguns testes falharam. Verifique os logs acima.');
  }
}

runTests().catch(console.error);