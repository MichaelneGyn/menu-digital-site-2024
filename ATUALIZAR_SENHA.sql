-- ATUALIZAR SENHA DO ADMIN
-- Senha: admin123
-- Hash gerado: $2a$10$XpUvDFRYMAJkmTtmHev7P.2F2jDpXq68bPr5NwI88yc/ajnM94o2i

UPDATE "User" 
SET password = '$2a$10$XpUvDFRYMAJkmTtmHev7P.2F2jDpXq68bPr5NwI88yc/ajnM94o2i' 
WHERE email = 'michaeldouglasqueiroz@gmail.com';

-- Verificar se foi atualizado:
SELECT email, password FROM "User" WHERE email = 'michaeldouglasqueiroz@gmail.com';
