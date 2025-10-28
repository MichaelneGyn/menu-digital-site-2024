/**
 * Script para testar e debugar o sistema de upload
 * Verifica Supabase Storage e Cloudinary
 */

const { createClient } = require('@supabase/supabase-js');
const { v2: cloudinary } = require('cloudinary');

// Configurações do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Configurações do Cloudinary
const cloudinaryName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryKey = process.env.CLOUDINARY_API_KEY;
const cloudinarySecret = process.env.CLOUDINARY_API_SECRET;

async function testSupabaseStorage() {
  console.log('\n🧪 TESTANDO SUPABASE STORAGE...\n');
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase não configurado');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Configurado' : '❌ Não configurado');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅ Configurado' : '❌ Não configurado');
    return false;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Listar buckets
    console.log('📦 Listando buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log('❌ Erro ao listar buckets:', listError.message);
      return false;
    }
    
    console.log('✅ Buckets encontrados:', buckets?.map(b => b.name) || []);
    
    // Verificar se o bucket 'menu-images' existe
    const menuImagesBucket = buckets?.find(b => b.name === 'menu-images');
    if (!menuImagesBucket) {
      console.log('❌ Bucket "menu-images" não encontrado!');
      console.log('💡 Você precisa criar o bucket "menu-images" no Supabase Dashboard');
      return false;
    }
    
    console.log('✅ Bucket "menu-images" encontrado!');
    
    // Testar upload de um arquivo pequeno
    console.log('📤 Testando upload...');
    const testBuffer = Buffer.from('test-image-data');
    const testPath = `test-uploads/test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(testPath, testBuffer, {
        contentType: 'text/plain',
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.log('❌ Erro no upload de teste:', uploadError.message);
      return false;
    }
    
    console.log('✅ Upload de teste bem-sucedido!');
    
    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from('menu-images')
      .getPublicUrl(testPath);
    
    console.log('✅ URL pública gerada:', publicUrlData.publicUrl);
    
    // Limpar arquivo de teste
    await supabase.storage.from('menu-images').remove([testPath]);
    console.log('✅ Arquivo de teste removido');
    
    return true;
    
  } catch (error) {
    console.log('❌ Erro no teste do Supabase:', error.message);
    return false;
  }
}

async function testCloudinary() {
  console.log('\n🧪 TESTANDO CLOUDINARY...\n');
  
  if (!cloudinaryName || !cloudinaryKey || !cloudinarySecret) {
    console.log('❌ Cloudinary não configurado');
    console.log('CLOUDINARY_CLOUD_NAME:', cloudinaryName ? '✅ Configurado' : '❌ Não configurado');
    console.log('CLOUDINARY_API_KEY:', cloudinaryKey ? '✅ Configurado' : '❌ Não configurado');
    console.log('CLOUDINARY_API_SECRET:', cloudinarySecret ? '✅ Configurado' : '❌ Não configurado');
    return false;
  }

  try {
    // Configurar Cloudinary
    cloudinary.config({
      cloud_name: cloudinaryName,
      api_key: cloudinaryKey,
      api_secret: cloudinarySecret,
      secure: true,
    });

    console.log('✅ Cloudinary configurado');
    
    // Testar upload de um arquivo pequeno
    console.log('📤 Testando upload...');
    const testBuffer = Buffer.from('test-image-data');
    
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'menu-digital',
          public_id: `test-${Date.now()}`,
          resource_type: 'raw', // Para arquivo de teste
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(testBuffer);
    });
    
    console.log('✅ Upload de teste bem-sucedido!');
    console.log('✅ URL gerada:', result.secure_url);
    
    // Limpar arquivo de teste
    await cloudinary.uploader.destroy(result.public_id, { resource_type: 'raw' });
    console.log('✅ Arquivo de teste removido');
    
    return true;
    
  } catch (error) {
    console.log('❌ Erro no teste do Cloudinary:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 DIAGNÓSTICO DO SISTEMA DE UPLOAD\n');
  console.log('=====================================');
  
  const supabaseWorking = await testSupabaseStorage();
  const cloudinaryWorking = await testCloudinary();
  
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('=====================');
  console.log('Supabase Storage:', supabaseWorking ? '✅ Funcionando' : '❌ Com problemas');
  console.log('Cloudinary:', cloudinaryWorking ? '✅ Funcionando' : '❌ Com problemas');
  
  if (!supabaseWorking && !cloudinaryWorking) {
    console.log('\n🚨 PROBLEMA CRÍTICO: Nenhum serviço de upload está funcionando!');
    console.log('\n💡 SOLUÇÕES:');
    console.log('1. Para Supabase: Crie o bucket "menu-images" no dashboard');
    console.log('2. Para Cloudinary: Verifique as credenciais no Vercel');
  } else if (!supabaseWorking) {
    console.log('\n⚠️ Supabase com problemas, mas Cloudinary funcionando');
    console.log('💡 O sistema usará Cloudinary como fallback');
  } else if (!cloudinaryWorking) {
    console.log('\n⚠️ Cloudinary com problemas, mas Supabase funcionando');
    console.log('💡 O sistema usará Supabase normalmente');
  } else {
    console.log('\n🎉 Ambos os serviços estão funcionando!');
    console.log('💡 O sistema usará Supabase como prioridade');
  }
}

main().catch(console.error);