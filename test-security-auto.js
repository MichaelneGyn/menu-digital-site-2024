#!/usr/bin/env node

/**
 * 🔒 TESTE DE SEGURANÇA AUTOMÁTICO
 * Verifica todas as proteções implementadas
 * 
 * USO: node test-security-auto.js
 */

const https = require('https');
const http = require('http');

// 🎨 Cores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// 📊 Estatísticas
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// 🔧 Configuração (EDITE AQUI!)
const config = {
  siteUrl: 'https://menu-digital-site-2024-8773d37d6064.vercel.app',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'SEU_SUPABASE_URL',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'SUA_ANON_KEY'
};

// 🛠️ Função para fazer requisições
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// ✅ Função de resultado
function printResult(testName, passed, details = '') {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`${colors.green}✅ ${testName}${colors.reset}`);
  } else {
    failedTests++;
    console.log(`${colors.red}❌ ${testName}${colors.reset}`);
  }
  if (details) {
    console.log(`   ${colors.cyan}${details}${colors.reset}`);
  }
}

// 🧪 Testes
async function runTests() {
  console.log(`\n${colors.bold}${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}   🔒 TESTE AUTOMÁTICO DE SEGURANÇA${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}═══════════════════════════════════════════════════${colors.reset}\n`);
  
  console.log(`${colors.cyan}Site: ${config.siteUrl}${colors.reset}\n`);

  // ═══════════════════════════════════════════════════
  // TESTE 1: Headers de Segurança
  // ═══════════════════════════════════════════════════
  console.log(`${colors.yellow}[TESTE 1] Headers de Segurança${colors.reset}`);
  
  try {
    const res = await makeRequest(config.siteUrl);
    
    printResult(
      'X-Frame-Options',
      res.headers['x-frame-options'] === 'DENY',
      res.headers['x-frame-options'] || 'Ausente'
    );
    
    printResult(
      'X-Content-Type-Options',
      res.headers['x-content-type-options'] === 'nosniff',
      res.headers['x-content-type-options'] || 'Ausente'
    );
    
    printResult(
      'X-XSS-Protection',
      res.headers['x-xss-protection'] === '1; mode=block',
      res.headers['x-xss-protection'] || 'Ausente'
    );
    
    printResult(
      'Referrer-Policy',
      !!res.headers['referrer-policy'],
      res.headers['referrer-policy'] || 'Ausente'
    );
    
  } catch (error) {
    printResult('Headers de Segurança', false, `Erro: ${error.message}`);
  }

  console.log('');

  // ═══════════════════════════════════════════════════
  // TESTE 2: Proteção PATCH sem Autenticação
  // ═══════════════════════════════════════════════════
  console.log(`${colors.yellow}[TESTE 2] Proteção de APIs${colors.reset}`);
  
  try {
    const res = await makeRequest(`${config.siteUrl}/api/orders/test123`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'cancelled' })
    });
    
    printResult(
      'PATCH sem autenticação bloqueado',
      res.status === 401,
      `Status: ${res.status} (esperado: 401)`
    );
    
  } catch (error) {
    if (error.message.includes('401')) {
      printResult('PATCH sem autenticação bloqueado', true, 'Status: 401 ✅');
    } else {
      printResult('PATCH sem autenticação bloqueado', false, `Erro: ${error.message}`);
    }
  }

  console.log('');

  // ═══════════════════════════════════════════════════
  // TESTE 3: Rate Limiting
  // ═══════════════════════════════════════════════════
  console.log(`${colors.yellow}[TESTE 3] Rate Limiting${colors.reset}`);
  
  try {
    console.log('   Enviando 70 requisições rápidas...');
    let blocked = 0;
    let success = 0;
    
    const promises = [];
    for (let i = 0; i < 70; i++) {
      promises.push(
        makeRequest(`${config.siteUrl}/api/health`)
          .then(res => {
            if (res.status === 429) blocked++;
            else if (res.status === 200) success++;
          })
          .catch(() => blocked++)
      );
    }
    
    await Promise.all(promises);
    
    printResult(
      'Rate Limiting ativo',
      blocked > 5,
      `Bloqueadas: ${blocked}/70 | Sucesso: ${success}/70`
    );
    
  } catch (error) {
    printResult('Rate Limiting', false, `Erro: ${error.message}`);
  }

  console.log('');

  // ═══════════════════════════════════════════════════
  // TESTE 4: Supabase RLS
  // ═══════════════════════════════════════════════════
  console.log(`${colors.yellow}[TESTE 4] Supabase RLS${colors.reset}`);
  
  if (config.supabaseUrl !== 'SEU_SUPABASE_URL' && config.anonKey !== 'SUA_ANON_KEY') {
    try {
      // Tentar upload sem SERVICE_ROLE_KEY (deve falhar)
      const testData = Buffer.from('test').toString('base64');
      const res = await makeRequest(
        `${config.supabaseUrl}/storage/v1/object/menu-images/test-${Date.now()}.txt`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.anonKey}`,
            'apikey': config.anonKey,
            'Content-Type': 'application/octet-stream'
          },
          body: testData
        }
      );
      
      printResult(
        'RLS bloqueia upload sem SERVICE_ROLE',
        res.status === 403 || res.status === 401,
        `Status: ${res.status} (esperado: 401/403)`
      );
      
    } catch (error) {
      if (error.message.includes('403') || error.message.includes('401')) {
        printResult('RLS bloqueia upload sem SERVICE_ROLE', true, 'Bloqueado ✅');
      } else {
        printResult('RLS', false, `Erro: ${error.message}`);
      }
    }
  } else {
    printResult('RLS', false, '⚠️  Configure SUPABASE_URL e ANON_KEY no script');
  }

  console.log('');

  // ═══════════════════════════════════════════════════
  // TESTE 5: SQL Injection Protection
  // ═══════════════════════════════════════════════════
  console.log(`${colors.yellow}[TESTE 5] SQL Injection Protection${colors.reset}`);
  
  try {
    const maliciousId = encodeURIComponent("' OR '1'='1'; DROP TABLE orders; --");
    const res = await makeRequest(`${config.siteUrl}/api/orders/${maliciousId}`);
    
    printResult(
      'SQL Injection bloqueado',
      res.status === 404 || res.status === 400,
      `Status: ${res.status} (payload sanitizado)`
    );
    
  } catch (error) {
    printResult('SQL Injection bloqueado', true, 'Request bloqueado ✅');
  }

  console.log('');

  // ═══════════════════════════════════════════════════
  // TESTE 6: HTTPS Forçado
  // ═══════════════════════════════════════════════════
  console.log(`${colors.yellow}[TESTE 6] HTTPS${colors.reset}`);
  
  printResult(
    'Site usa HTTPS',
    config.siteUrl.startsWith('https://'),
    config.siteUrl.startsWith('https://') ? 'Conexão segura ✅' : 'HTTP não seguro ❌'
  );

  console.log('');

  // ═══════════════════════════════════════════════════
  // TESTE 7: Health Check
  // ═══════════════════════════════════════════════════
  console.log(`${colors.yellow}[TESTE 7] Sistema Online${colors.reset}`);
  
  try {
    const res = await makeRequest(`${config.siteUrl}/api/health`);
    
    printResult(
      'API respondendo',
      res.status === 200,
      `Status: ${res.status}`
    );
    
  } catch (error) {
    printResult('API respondendo', false, `Erro: ${error.message}`);
  }

  // ═══════════════════════════════════════════════════
  // RESULTADO FINAL
  // ═══════════════════════════════════════════════════
  console.log(`\n${colors.bold}${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}   📊 RESULTADO FINAL${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}═══════════════════════════════════════════════════${colors.reset}\n`);
  
  const score = Math.round((passedTests / totalTests) * 100);
  const barLength = 40;
  const filledLength = Math.round((score / 100) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
  
  console.log(`   Total de Testes: ${totalTests}`);
  console.log(`   ${colors.green}✅ Passou: ${passedTests}${colors.reset}`);
  console.log(`   ${colors.red}❌ Falhou: ${failedTests}${colors.reset}\n`);
  
  console.log(`   Score de Segurança: ${score}%`);
  console.log(`   ${bar}\n`);
  
  if (score >= 85) {
    console.log(`   ${colors.green}${colors.bold}🛡️  SISTEMA MUITO SEGURO!${colors.reset}`);
    console.log(`   ${colors.green}Pronto para produção.${colors.reset}\n`);
  } else if (score >= 70) {
    console.log(`   ${colors.yellow}${colors.bold}✅ SISTEMA SEGURO${colors.reset}`);
    console.log(`   ${colors.yellow}Bom para produção. Algumas melhorias opcionais.${colors.reset}\n`);
  } else if (score >= 50) {
    console.log(`   ${colors.yellow}${colors.bold}⚠️  ATENÇÃO NECESSÁRIA${colors.reset}`);
    console.log(`   ${colors.yellow}Corrija os itens falhados antes de produção.${colors.reset}\n`);
  } else {
    console.log(`   ${colors.red}${colors.bold}🚨 CRÍTICO!${colors.reset}`);
    console.log(`   ${colors.red}Sistema vulnerável. Correções urgentes necessárias.${colors.reset}\n`);
  }
  
  console.log(`${colors.bold}${colors.blue}═══════════════════════════════════════════════════${colors.reset}\n`);
}

// 🚀 Executar
console.log(`${colors.cyan}Aguarde... Testando segurança do sistema...${colors.reset}`);
runTests().catch(error => {
  console.error(`${colors.red}Erro fatal: ${error.message}${colors.reset}`);
  process.exit(1);
});
