const https = require('https');
const http = require('http');

// Test the newest deployment URL with the fixed middleware
const PRODUCTION_URL = 'https://menu-digital-site-2024-8773d37d606448f665f364adadb0d-81zmcjl98.vercel.app';

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'User-Agent': 'Test-Script/1.0',
        'Accept': 'application/json, text/html, */*',
      },
      timeout: 10000
    };

    if (data) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body.substring(0, 500) // Limit body size for logging
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

async function testCurrentProduction() {
  console.log('🧪 Testando a versão atual de produção...\n');
  console.log(`🌐 URL de produção: ${PRODUCTION_URL}\n`);

  const tests = [
    {
      name: 'Página Principal',
      url: `${PRODUCTION_URL}`,
      expectedStatus: 200,
      description: 'Deve carregar a página principal'
    },
    {
      name: 'Health Check API',
      url: `${PRODUCTION_URL}/api/health`,
      expectedStatus: 200,
      description: 'Deve retornar status de saúde da API'
    },
    {
      name: 'Upload Endpoint',
      url: `${PRODUCTION_URL}/api/upload`,
      expectedStatus: 400, // Esperamos 400 sem arquivo, não 401
      description: 'Deve aceitar requisições (400 sem arquivo é OK)'
    },
    {
      name: 'Menu Público',
      url: `${PRODUCTION_URL}/api/menu`,
      expectedStatus: 200,
      description: 'Deve retornar menu público'
    },
    {
      name: 'Restaurantes Públicos',
      url: `${PRODUCTION_URL}/api/restaurants`,
      expectedStatus: 200,
      description: 'Deve retornar lista de restaurantes'
    },
    {
      name: 'Admin Dashboard (Protegido)',
      url: `${PRODUCTION_URL}/admin/dashboard`,
      expectedStatus: 401,
      description: 'Deve estar protegido (401 é esperado)'
    }
  ];

  let passedTests = 0;
  let failedTests = 0;

  for (const test of tests) {
    try {
      console.log(`🔍 Testando: ${test.name}`);
      console.log(`   URL: ${test.url}`);
      
      const result = await makeRequest(test.url);
      const passed = result.status === test.expectedStatus;
      
      if (passed) {
        console.log(`   ✅ PASSOU - Status: ${result.status} (esperado: ${test.expectedStatus})`);
        passedTests++;
      } else {
        console.log(`   ❌ FALHOU - Status: ${result.status} (esperado: ${test.expectedStatus})`);
        failedTests++;
      }
      
      console.log(`   📝 ${test.description}`);
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ ERRO - ${error.message}`);
      console.log(`   📝 ${test.description}`);
      console.log('');
      failedTests++;
    }
  }

  console.log('📊 RESUMO DOS TESTES:');
  console.log(`✅ Testes que passaram: ${passedTests}`);
  console.log(`❌ Testes que falharam: ${failedTests}`);
  console.log(`📈 Taxa de sucesso: ${((passedTests / tests.length) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('\n🎉 Todos os testes passaram! A versão atual está funcionando corretamente.');
  } else {
    console.log(`\n⚠️  ${failedTests} teste(s) falharam. Pode haver problemas na configuração.`);
  }
}

testCurrentProduction().catch(console.error);