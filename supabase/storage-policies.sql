-- ============================================
-- 🔒 SUPABASE STORAGE - POLÍTICAS DE SEGURANÇA (RLS)
-- ============================================
-- Execute estas queries no Supabase SQL Editor
-- Dashboard → SQL Editor → New Query
-- ============================================

-- ============================================
-- 1. HABILITAR RLS NO BUCKET
-- ============================================
-- IMPORTANTE: RLS DEVE estar ativo para segurança!

-- Verificar se RLS está ativo
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- Se rowsecurity = false, ATIVE agora:
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. POLÍTICAS PARA BUCKET 'menu-images'
-- ============================================

-- 🔹 POLÍTICA 1: Permitir UPLOAD apenas para usuários autenticados ou service_role
-- (Apenas admins podem fazer upload)
CREATE POLICY "Admin can upload menu images"
ON storage.objects
FOR INSERT
TO authenticated, service_role
WITH CHECK (
    bucket_id = 'menu-images' 
    AND auth.role() IN ('authenticated', 'service_role')
);

-- 🔹 POLÍTICA 2: Permitir LEITURA PÚBLICA das imagens
-- (Qualquer pessoa pode VER as imagens do cardápio)
CREATE POLICY "Public can view menu images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'menu-images');

-- 🔹 POLÍTICA 3: Permitir DELETE apenas para service_role
-- (Apenas sistema pode deletar)
CREATE POLICY "Admin can delete menu images"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'menu-images');

-- 🔹 POLÍTICA 4: Permitir UPDATE apenas para service_role
CREATE POLICY "Admin can update menu images"
ON storage.objects
FOR UPDATE
TO service_role
USING (bucket_id = 'menu-images')
WITH CHECK (bucket_id = 'menu-images');

-- ============================================
-- 3. CONFIGURAR O BUCKET COMO PÚBLICO
-- ============================================
-- No Supabase Dashboard:
-- Storage → menu-images → Settings → Public bucket: ON

-- Ou via SQL:
UPDATE storage.buckets 
SET public = true 
WHERE name = 'menu-images';

-- ============================================
-- 4. VERIFICAR POLÍTICAS ATIVAS
-- ============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- ============================================
-- 5. REMOVER POLÍTICAS ANTIGAS (SE NECESSÁRIO)
-- ============================================
-- Se houver conflito, remova políticas antigas:

-- DROP POLICY IF EXISTS "Admin can upload menu images" ON storage.objects;
-- DROP POLICY IF EXISTS "Public can view menu images" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin can delete menu images" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin can update menu images" ON storage.objects;

-- Depois recrie usando as queries acima

-- ============================================
-- 6. TESTE DE SEGURANÇA
-- ============================================

-- ✅ TESTE 1: Verificar se RLS está ATIVO
-- Resultado esperado: rowsecurity = true
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'objects';

-- ✅ TESTE 2: Contar políticas ativas
-- Resultado esperado: pelo menos 4 políticas
SELECT COUNT(*) as total_policies 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- ✅ TESTE 3: Listar todas as políticas
-- Resultado esperado: ver as 4 políticas criadas acima
SELECT 
    policyname as "Nome da Política",
    cmd as "Operação",
    roles as "Papéis"
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- ============================================
-- 7. POLÍTICAS ALTERNATIVAS (MAIS RESTRITIVAS)
-- ============================================
-- Se quiser que apenas service_role possa fazer tudo:

/*
-- Remover políticas antigas
DROP POLICY IF EXISTS "Admin can upload menu images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete menu images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update menu images" ON storage.objects;

-- Criar política única para service_role
CREATE POLICY "Service role full access to menu images"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'menu-images')
WITH CHECK (bucket_id = 'menu-images');

-- Manter política de leitura pública
CREATE POLICY "Public read menu images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'menu-images');
*/

-- ============================================
-- 8. MONITORAMENTO
-- ============================================

-- Ver tentativas de acesso bloqueadas (logs do Supabase)
-- Dashboard → Logs → Storage

-- Verificar tamanho do bucket
SELECT 
    pg_size_pretty(SUM(metadata->>'size')::bigint) as "Tamanho Total"
FROM storage.objects
WHERE bucket_id = 'menu-images';

-- Contar arquivos no bucket
SELECT COUNT(*) as "Total de Imagens"
FROM storage.objects
WHERE bucket_id = 'menu-images';

-- ============================================
-- 9. SEGURANÇA ADICIONAL
-- ============================================

-- Limitar tamanho máximo de arquivo (50MB)
UPDATE storage.buckets
SET file_size_limit = 52428800
WHERE name = 'menu-images';

-- Limitar tipos de arquivo permitidos
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
]
WHERE name = 'menu-images';

-- ============================================
-- 10. TROUBLESHOOTING
-- ============================================

-- Se uploads falharem com erro "new row violates row-level security policy"
-- Verifique:
-- 1. RLS está ativo? (deve estar)
-- 2. Políticas existem? (use query de verificação acima)
-- 3. Está usando SERVICE_ROLE_KEY? (não ANON_KEY)
-- 4. Bucket existe? (Storage → Buckets)
-- 5. Bucket é público? (Storage → menu-images → Settings)

-- Para debug, temporariamente DESABILITE RLS (NÃO FAÇA EM PRODUÇÃO!)
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
-- TESTE O UPLOAD
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ✅ CHECKLIST FINAL
-- ============================================
/*
☐ RLS está ENABLE em storage.objects
☐ Bucket 'menu-images' existe
☐ Bucket 'menu-images' é PUBLIC
☐ 4 políticas criadas (upload, read, delete, update)
☐ SERVICE_ROLE_KEY configurada no .env
☐ Tamanho máximo configurado (50MB)
☐ Tipos MIME permitidos configurados
☐ Testes de upload funcionando
☐ URLs públicas acessíveis
*/

-- ============================================
-- 📚 REFERÊNCIAS
-- ============================================
-- Documentação oficial: https://supabase.com/docs/guides/storage/security/access-control
-- RLS: https://supabase.com/docs/guides/auth/row-level-security
