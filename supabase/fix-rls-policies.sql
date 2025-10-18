-- ============================================
-- 🔒 LIMPAR E RECRIAR POLÍTICAS RLS (CORRETO)
-- ============================================
-- COPIE E EXECUTE TUDO DE UMA VEZ
-- ============================================

-- PASSO 1: REMOVER TODAS AS POLÍTICAS ANTIGAS
-- ============================================
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow service_role uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public can view files" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Service Role can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete items" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete own" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload items" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view items" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete" ON storage.objects;
DROP POLICY IF EXISTS "Service role can update" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload" ON storage.objects;

-- PASSO 2: CRIAR APENAS AS 4 POLÍTICAS NECESSÁRIAS
-- ============================================

-- 1️⃣ LEITURA PÚBLICA (Qualquer pessoa pode VER as imagens do cardápio)
CREATE POLICY "menu_images_public_read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'menu-images');

-- 2️⃣ UPLOAD RESTRITO (Apenas service_role pode fazer upload)
CREATE POLICY "menu_images_service_insert"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'menu-images');

-- 3️⃣ DELETE RESTRITO (Apenas service_role pode deletar)
CREATE POLICY "menu_images_service_delete"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'menu-images');

-- 4️⃣ UPDATE RESTRITO (Apenas service_role pode atualizar)
CREATE POLICY "menu_images_service_update"
ON storage.objects
FOR UPDATE
TO service_role
USING (bucket_id = 'menu-images')
WITH CHECK (bucket_id = 'menu-images');

-- PASSO 3: VERIFICAR SE FUNCIONOU
-- ============================================
SELECT 
    policyname as "✅ Política",
    cmd as "Operação",
    roles as "Quem pode"
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE 'menu_images%'
ORDER BY policyname;

-- Resultado esperado: APENAS 4 políticas
-- menu_images_public_read     | SELECT | {public}
-- menu_images_service_insert  | INSERT | {service_role}
-- menu_images_service_delete  | DELETE | {service_role}
-- menu_images_service_update  | UPDATE | {service_role}
