-- ========================================
-- CRIAR USUÁRIO DEMO NO SUPABASE
-- ========================================
-- Execute este SQL no Supabase SQL Editor
-- ========================================

-- PASSO 1: Gere o hash da senha 'demo123' em https://bcrypt-generator.com/
-- PASSO 2: Substitua o hash abaixo pelo gerado
-- PASSO 3: Execute este SQL

-- Criar usuário demo
INSERT INTO "User" (
  id,
  name,
  email,
  password,
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Usuário Demo',
  'demo@virtualcardapio.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',  -- ⚠️ SUBSTITUA ESTE HASH
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verificar se foi criado
SELECT 
  id, 
  name, 
  email, 
  "createdAt",
  'Senha: demo123' as nota
FROM "User" 
WHERE email = 'demo@virtualcardapio.com';

-- ========================================
-- CREDENCIAIS DE ACESSO:
-- ========================================
-- 📧 Email: demo@virtualcardapio.com
-- 🔑 Senha: demo123
-- ========================================

-- OPCIONAL: Criar restaurante demo para o usuário
-- (Execute após criar o usuário)

-- INSERT INTO "Restaurant" (
--   id,
--   name,
--   slug,
--   "userId",
--   whatsapp,
--   address,
--   "deliveryFee",
--   "minOrderValue",
--   "primaryColor",
--   "isActive",
--   "createdAt",
--   "updatedAt"
-- )
-- SELECT
--   gen_random_uuid(),
--   'Restaurante Demo',
--   'demo',
--   id,
--   '(11) 99999-9999',
--   'Rua Demo, 123',
--   5.00,
--   20.00,
--   '#FF6B35',
--   true,
--   NOW(),
--   NOW()
-- FROM "User"
-- WHERE email = 'demo@virtualcardapio.com'
-- ON CONFLICT (slug) DO NOTHING;
