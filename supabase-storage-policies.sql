-- Políticas de Storage para o bucket 'menu-images'
-- Execute estas queries no SQL Editor do Supabase Dashboard

-- 1. Política UPDATE: Permite que usuários autenticados atualizem arquivos
CREATE POLICY "Authenticated users can update files" ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'menu-images')
WITH CHECK (bucket_id = 'menu-images');

-- 2. Política DELETE: Permite que usuários autenticados deletem arquivos
CREATE POLICY "Authenticated users can delete files" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'menu-images');

-- 3. Verificar políticas existentes (opcional - para debug)
-- SELECT * FROM storage.policies WHERE bucket_id = 'menu-images';

-- 4. Habilitar RLS no bucket se ainda não estiver habilitado
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Nota: As políticas SELECT e INSERT já devem estar configuradas.
-- Se precisar criar todas as políticas do zero, descomente as linhas abaixo:

/*
-- Política SELECT: Permite leitura pública
CREATE POLICY "Public can view files" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'menu-images');

-- Política INSERT: Permite que usuários autenticados façam upload
CREATE POLICY "Authenticated users can upload files" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'menu-images');
*/