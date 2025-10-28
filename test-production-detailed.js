const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://menu-digital-site-2024-8773d37d606448f665f364adadb0d-gd6b2uu49.vercel.app';

console.log('🔍 DIAGNÓSTICO DETALHADO DA PRODUÇÃO');
console.log('=====================================');
console.log(`URL: ${PRODUCTION_URL}`);
console.log('');

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 10000, // 10 segundos
      ...options
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          ok: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testEndpoint(name, url, options = {}) {
  console.log(`\n🧪 Testando: ${name}`);
  console.log(`   URL: ${url}`);
  
  try {
    const startTime = Date.now();
    const response = await makeRequest(url, options);
    const duration = Date.now() - startTime;
    
    console.log(`   ⏱️  Tempo: ${duration}ms`);
    console.log(`   📊 Status: ${response.status}`);
    console.log(`   🔍 Headers: ${JSON.stringify(response.headers, null, 2)}`);
    
    if (response.data) {
      try {
        const jsonData = JSON.parse(response.data);
        console.log(`   📄 Resposta: ${JSON.stringify(jsonData, null, 2)}`);
      } catch {
        console.log(`   📄 Resposta (texto): ${response.data.substring(0, 200)}...`);
      }
    }
    
    const status = response.ok ? '✅ OK' : '❌ Problema';
    console.log(`   🎯 Resultado: ${status}`);
    
    return response;
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    console.log(`   🎯 Resultado: ❌ Falhou`);
    return { error: error.message, status: 0 };
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes...\n');

  // 1. Teste básico da aplicação
  await testEndpoint('Página Principal', PRODUCTION_URL);

  // 2. Teste do Health Check
  await testEndpoint('Health Check', `${PRODUCTION_URL}/api/health`);

  // 3. Teste do endpoint de upload (sem arquivo - deve dar 400)
  await testEndpoint('Upload Endpoint (sem arquivo)', `${PRODUCTION_URL}/api/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });

  // 4. Teste do painel admin
  await testEndpoint('Admin Panel', `${PRODUCTION_URL}/admin/dashboard`);

  // 5. Teste de autenticação
  await testEndpoint('Auth Login Page', `${PRODUCTION_URL}/auth/login`);

  // 6. Teste de API protegida
  await testEndpoint('API Protegida (sem auth)', `${PRODUCTION_URL}/api/admin/restaurants`);

  console.log('\n📋 RESUMO DOS TESTES:');
  console.log('====================');
  console.log('✅ = Funcionando');
  console.log('❌ = Com problemas');
  console.log('⚠️  = Indisponível/Timeout');
  console.log('\nSe algum teste falhou, verifique:');
  console.log('1. Variáveis de ambiente no Vercel');
  console.log('2. Configuração do banco de dados');
  console.log('3. Credenciais do Cloudinary');
  console.log('4. Logs do Vercel para mais detalhes');
}

runTests().catch(console.error);