-- Adicionar política para permitir visualização pública dos restaurantes
-- Isso permite que qualquer pessoa veja os restaurantes sem autenticação

-- Primeiro, vamos dropar a política restritiva existente
DROP POLICY IF EXISTS "Users can view own restaurants" ON public.restaurants;

-- Criar nova política que permite visualização pública
CREATE POLICY "Public can view restaurants"
ON public.restaurants FOR SELECT
USING (true);

-- Verificar se a política foi criada
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'restaurants';