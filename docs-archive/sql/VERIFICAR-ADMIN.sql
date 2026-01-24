-- ============================================
-- VERIFICAR E CONFIGURAR ADMIN
-- ============================================

-- 1️⃣ VERIFICAR SE VOCÊ É ADMIN
SELECT 
    id,
    email,
    name,
    role,
    "createdAt"
FROM "User"
WHERE email = 'michaeldouglasqueiroz@gmail.com';

-- 2️⃣ SE NÃO FOR ADMIN, TORNAR ADMIN
UPDATE "User"
SET role = 'ADMIN'
WHERE email = 'michaeldouglasqueiroz@gmail.com';

-- 3️⃣ VERIFICAR NOVAMENTE
SELECT 
    id,
    email,
    name,
    role
FROM "User"
WHERE email = 'michaeldouglasqueiroz@gmail.com';

-- Deve retornar: role = 'ADMIN'

-- ============================================
-- PRONTO! ✅
-- ============================================
