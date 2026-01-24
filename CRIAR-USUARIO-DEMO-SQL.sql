-- ========================================
-- CRIAR USUÁRIO DEMO
-- ========================================
-- Execute este SQL no Supabase SQL Editor
-- ou em qualquer cliente PostgreSQL

-- 1. Criar usuário demo
-- Senha: demo123 (hash bcrypt)
INSERT INTO "User" (id, name, email, password, "createdAt", "updatedAt")
VALUES (
  'demo-user-id-12345',
  'Usuário Demo',
  'demo@virtualcardapio.com',
  '$2a$10$YourBcryptHashHere',  -- Você precisa gerar o hash de 'demo123'
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- CREDENCIAIS DE ACESSO:
-- ========================================
-- Email: demo@virtualcardapio.com
-- Senha: demo123
-- ========================================

-- NOTA: O hash da senha precisa ser gerado com bcrypt
-- Use este site para gerar: https://bcrypt-generator.com/
-- Senha: demo123
-- Rounds: 10
-- Copie o hash gerado e substitua acima
