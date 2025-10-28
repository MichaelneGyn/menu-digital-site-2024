// Teste do upload na produção após deploy
const https = require('https');
const fs = require('fs');
const path = require('path');

const PRODUCTION_URL = 'menu-digital-site-2024-8773d37d606448f665f364adadb0d-6jxfx3hz6.vercel.app';

console.log('🧪 TESTANDO UPLOAD NA NOVA VERSÃO DE PRODUÇÃO\n');
console.log(`🌐 URL: https://${PRODUCTION_URL}`);
console.log('📅 Deploy: Recém atualizado\n');

// Teste 1: Verificar se a API de upload está respondendo
function testUploadEndpoint() {
  return new Promise((resolve) => {
    const options = {
      hostname: PRODUCTION_URL,
      port: 443,
      path: '/api/upload',
      method: 'GET',
      headers: {
        'User-Agent': 'Upload-Test-Script'
      }
    };

    console.log('🔍 Testando endpoint /api/upload...');

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        
        if (res.statusCode === 405) {
          console.log('✅ Endpoint existe (Method Not Allowed é esperado para GET)');
          resolve(true);
        } else if (res.statusCode === 200) {
          console.log('✅ Endpoint respondendo normalmente');
          resolve(true);
        } else {
          console.log(`❌ Problema no endpoint: ${res.statusCode}`);
          console.log(`Resposta: ${data.substring(0, 200)}...`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Erro ao conectar: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      console.log('❌ Timeout na conexão');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Teste 2: Verificar se o painel admin está acessível
function testAdminPanel() {
  return new Promise((resolve) => {
    const options = {
      hostname: PRODUCTION_URL,
      port: 443,
      path: '/admin/dashboard',
      method: 'GET',
      headers: {
        'User-Agent': 'Upload-Test-Script'
      }
    };

    console.log('🔍 Testando painel admin...');

    const req = https.request(options, (res) => {
      console.log(`📊 Status: ${res.statusCode}`);
      
      if (res.statusCode === 200 || res.statusCode === 302 || res.statusCode === 401) {
        console.log('✅ Painel admin acessível');
        resolve(true);
      } else {
        console.log(`❌ Problema no painel admin: ${res.statusCode}`);
        resolve(false);
      }
    });

    req.on('error', (err) => {
      console.log(`❌ Erro ao acessar admin: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      console.log('❌ Timeout no admin');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Teste 3: Verificar se as variáveis de ambiente estão sendo carregadas
function testEnvironmentCheck() {
  return new Promise((resolve) => {
    const options = {
      hostname: PRODUCTION_URL,
      port: 443,
      path: '/api/health',
      method: 'GET',
      headers: {
        'User-Agent': 'Upload-Test-Script'
      }
    };

    console.log('🔍 Testando health check...');

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          try {
            const healthData = JSON.parse(data);
            console.log('✅ Health check OK');
            console.log(`📋 Dados: ${JSON.stringify(healthData, null, 2)}`);
          } catch (e) {
            console.log('✅ Health check respondendo (não é JSON)');
          }
          resolve(true);
        } else {
          console.log(`⚠️  Health check: ${res.statusCode}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Erro no health check: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      console.log('❌ Timeout no health check');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function runProductionTests() {
  console.log('🚀 INICIANDO TESTES DE PRODUÇÃO...\n');

  const uploadEndpoint = await testUploadEndpoint();
  console.log('');
  
  const adminPanel = await testAdminPanel();
  console.log('');
  
  const healthCheck = await testEnvironmentCheck();
  console.log('');

  console.log('📊 RESUMO DOS TESTES:');
  console.log('=====================');
  console.log(`Upload Endpoint: ${uploadEndpoint ? '✅ OK' : '❌ Problema'}`);
  console.log(`Admin Panel: ${adminPanel ? '✅ OK' : '❌ Problema'}`);
  console.log(`Health Check: ${healthCheck ? '✅ OK' : '⚠️  Indisponível'}`);

  if (uploadEndpoint && adminPanel) {
    console.log('\n🎉 APLICAÇÃO ESTÁ FUNCIONANDO!');
    console.log('🔗 Teste o upload manualmente em:');
    console.log(`   https://${PRODUCTION_URL}/admin/dashboard`);
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('1. Faça login no painel admin');
    console.log('2. Tente adicionar um item com imagem');
    console.log('3. Verifique se o upload funciona');
  } else {
    console.log('\n🚨 PROBLEMAS DETECTADOS!');
    console.log('A aplicação pode não estar funcionando corretamente.');
  }
}

runProductionTests().catch(console.error);