## Causa Provável
- O projeto usa `3001` para desenvolvimento (`package.json` tem `next dev -p 3001`).
- Você está acessando `http://localhost:3000`, que não tem servidor ativo.
- `NEXTAUTH_URL` deve apontar para `http://localhost:3001` e `NEXTAUTH_SECRET` precisa existir em `.env.local`.

## O que Vou Fazer
1. Iniciar o servidor de desenvolvimento com `npm run dev` na raiz do projeto.
2. Validar que está ouvindo em `http://localhost:3001` e abrir a página `http://localhost:3001/auth/register`.
3. Conferir `.env.local` e ajustar (se necessário):
   - `NEXTAUTH_URL=http://localhost:3001`
   - `NEXTAUTH_SECRET=<chave segura>`
4. Verificar a saúde da API em `http://localhost:3001/api/health` para confirmar backend ativo.
5. Se você preferir `3000`, eu altero os scripts para `-p 3000` e atualizo `NEXTAUTH_URL` para `http://localhost:3000`.

## Validações
- Verificar logs do servidor sem erros críticos.
- Confirmar acesso às rotas `auth`, páginas principais e APIs.
- Se a porta estiver ocupada ou bloqueada, checar conflitos de porta e firewall.

Confirma que posso executar esses passos agora? 