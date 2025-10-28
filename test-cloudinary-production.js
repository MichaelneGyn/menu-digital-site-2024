// Teste específico das credenciais Cloudinary do Vercel
const https = require('https');

// Credenciais do Vercel
const CLOUDINARY_CLOUD_NAME = 'ati5nleryz';
const CLOUDINARY_API_KEY = '694832759948149';
const CLOUDINARY_API_SECRET = 'ETeI6CAGuP8AVtYGuhLiqupZBH8';

console.log('🧪 TESTANDO CREDENCIAIS CLOUDINARY DO VERCEL\n');

// Teste 1: Verificar se o cloud_name existe
function testCloudName() {
  return new Promise((resolve) => {
    const url = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/sample.jpg`;
    
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Cloud Name válido - conseguiu acessar imagem de exemplo');
        resolve(true);
      } else {
        console.log(`❌ Cloud Name inválido - Status: ${res.statusCode}`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.log(`❌ Erro ao testar cloud name: ${err.message}`);
      resolve(false);
    });
  });
}

// Teste 2: Verificar API usando Admin API
function testAdminAPI() {
  return new Promise((resolve) => {
    const crypto = require('crypto');
    
    // Criar assinatura para Admin API
    const timestamp = Math.round(Date.now() / 1000);
    const stringToSign = `timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');
    
    const postData = `timestamp=${timestamp}&signature=${signature}&api_key=${CLOUDINARY_API_KEY}`;
    
    const options = {
      hostname: 'api.cloudinary.com',
      port: 443,
      path: `/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64')}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ API Key e Secret válidos - Admin API funcionando');
          resolve(true);
        } else {
          console.log(`❌ API inválida - Status: ${res.statusCode}`);
          console.log(`Resposta: ${data}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Erro na Admin API: ${err.message}`);
      resolve(false);
    });

    req.end();
  });
}

async function runTests() {
  console.log('📋 CREDENCIAIS SENDO TESTADAS:');
  console.log(`Cloud Name: ${CLOUDINARY_CLOUD_NAME}`);
  console.log(`API Key: ${CLOUDINARY_API_KEY}`);
  console.log(`API Secret: ${CLOUDINARY_API_SECRET.substring(0, 8)}...`);
  console.log('\n🔍 EXECUTANDO TESTES...\n');

  const cloudNameValid = await testCloudName();
  const apiValid = await testAdminAPI();

  console.log('\n📊 RESULTADO DOS TESTES:');
  console.log('========================');
  console.log(`Cloud Name: ${cloudNameValid ? '✅ Válido' : '❌ Inválido'}`);
  console.log(`API Credentials: ${apiValid ? '✅ Válidas' : '❌ Inválidas'}`);

  if (cloudNameValid && apiValid) {
    console.log('\n🎉 CLOUDINARY ESTÁ FUNCIONANDO!');
    console.log('O upload de imagens deve estar funcionando na produção.');
  } else {
    console.log('\n🚨 CLOUDINARY COM PROBLEMAS!');
    console.log('Será necessário criar uma nova conta ou verificar as credenciais.');
  }
}

runTests().catch(console.error);