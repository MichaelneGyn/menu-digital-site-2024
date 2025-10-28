const https = require('https');

const FINAL_URL = 'https://menu-digital-site-2024-8773d37d606448f665f364adadb0d-ov1eacyix.vercel.app';

console.log('🎯 TESTE FINAL - MIDDLEWARE CORRIGIDO');
console.log('====================================');
console.log(`URL Final: ${FINAL_URL}`);
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
  const url = `${FINAL_URL}${endpoint}`;
  console.log(`🧪 ${name}`);
  
  try {
    const response = await makeRequest(url);
    const isSuccess = response.status === expectedStatus;
    const status = isSuccess ? '✅ OK' : '❌ Problema';
    
    console.log(`   📊 Status: ${response.status} (esperado: ${expectedStatus})`);
    console.log(`   🎯 Resultado: ${status}`);
    
    if (response.data && response.data.length < 300) {
      try {
        const json = JSON.parse(response.data);
        console.log(`   📄 Resposta: ${JSON.stringify(json, null, 2)}`);
      } catch {
        // Não é JSON, mostra texto
      }
    }
    
    return isSuccess;
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return false;
  }
}

async function runFinalTest() {
  console.log('🚀 Executando teste final...\n');

  const results = [];

  // Testes principais
  results.push(await testEndpoint('Health Check', '/api/health', 200));
  console.log('');
  
  results.push(await testEndpoint('Upload Endpoint', '/api/upload', 400)); // 400 = sem arquivo (correto)
  console.log('');
  
  results.push(await testEndpoint('Menu Público', '/api/menu', 200));
  console.log('');

  const successCount = results.filter(r => r).length;
  const totalTests = results.length;

  console.log('🏆 RESULTADO FINAL:');
  console.log('==================');
  
  if (successCount === totalTests) {
    console.log('🎉 SUCESSO TOTAL!');
    console.log('✅ Health Check: Funcionando');
    console.log('✅ Upload Endpoint: Funcionando');
    console.log('✅ Menu Público: Funcionando');
    console.log('');
    console.log('🚀 AGORA VOCÊ PODE TESTAR O UPLOAD NO PAINEL ADMIN!');
    console.log(`🔗 Acesse: ${FINAL_URL}/admin/dashboard`);
  } else {
    console.log(`⚠️ ${totalTests - successCount} teste(s) ainda falhando`);
    console.log('Verifique os logs acima para mais detalhes.');
  }
}

runFinalTest().catch(console.error);