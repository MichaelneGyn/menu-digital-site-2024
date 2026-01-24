# Guia de Segurança - Menu Digital

## 🔒 Correções de Segurança Implementadas

### 1. **Proteção de Credenciais**
- ⚠️ **CRÍTICO**: Nunca commite o arquivo `.env` no Git
- Use `.env.example` como template
- Adicione `.env` ao `.gitignore`
- Gere um `NEXTAUTH_SECRET` forte usando: `openssl rand -base64 32`

### 2. **Rate Limiting**
Implementado rate limiting em endpoints de autenticação:
- **Forgot Password**: 5 tentativas a cada 15 minutos por IP
- **Reset Password**: 5 tentativas a cada 15 minutos por IP  
- **Signup**: 5 tentativas a cada 15 minutos por IP

**Arquivo**: `lib/rate-limit.ts`

### 3. **Hash de Senhas**
- Usando bcrypt com salt de 12 rounds (padrão seguro)
- Consistência em todos os endpoints de autenticação

### 4. **Upload de Arquivos Seguro**
Validações implementadas:
- ✅ Validação de tipo MIME
- ✅ Validação de extensão de arquivo
- ✅ Validação de magic numbers (assinaturas de arquivo)
- ✅ Limite de tamanho: 5MB
- ✅ Apenas imagens permitidas (jpg, jpeg, png, gif, webp)

### 5. **Singleton do PrismaClient**
- Corrigido uso direto de `new PrismaClient()` nas rotas de API
- Agora todas as rotas usam o singleton em `lib/db.ts`
- Previne esgotamento de conexões com o banco de dados

### 6. **Proteção de Logs**
- Removidos logs sensíveis em produção
- Console.log apenas em ambiente de desenvolvimento

## 🛡️ Recomendações Adicionais

### Para Produção:

1. **Variáveis de Ambiente**
   ```bash
   # Gerar NEXTAUTH_SECRET seguro
   openssl rand -base64 32
   ```

2. **HTTPS**
   - Use sempre HTTPS em produção
   - Configure certificados SSL/TLS válidos

3. **Headers de Segurança**
   Adicione no `next.config.js`:
   ```javascript
   async headers() {
     return [
       {
         source: '/(.*)',
         headers: [
           { key: 'X-Content-Type-Options', value: 'nosniff' },
           { key: 'X-Frame-Options', value: 'DENY' },
           { key: 'X-XSS-Protection', value: '1; mode=block' },
         ],
       },
     ]
   }
   ```

4. **Rate Limiting Avançado**
   - Em produção, use Redis para rate limiting distribuído
   - Considere usar serviços como Cloudflare ou AWS WAF

5. **Validação de Entrada**
   - Todas as rotas usam validação com Zod ✅
   - Mantenha validações rigorosas

6. **CORS**
   - Configure CORS adequadamente para sua aplicação
   - Restrinja origens permitidas em produção

7. **Database**
   - Use conexões SSL com o banco de dados
   - Implemente backups regulares
   - Use prepared statements (Prisma já faz isso) ✅

8. **Monitoramento**
   - Implemente logging centralizado
   - Configure alertas para tentativas de ataque
   - Use ferramentas como Sentry para monitoramento de erros

## 🔍 Checklist de Segurança

- [x] Credenciais não estão no código
- [x] Rate limiting implementado
- [x] Hash de senhas seguro (bcrypt com salt 12)
- [x] Upload de arquivos validado
- [x] Singleton do Prisma Client
- [x] Validação de entrada (Zod)
- [x] Autenticação implementada (NextAuth)
- [ ] HTTPS configurado (apenas em produção)
- [ ] Headers de segurança (recomendado para produção)
- [ ] CORS configurado
- [ ] Monitoramento e logging

## 📝 Notas Importantes

1. **Arquivo .env**:
   - Nunca compartilhe seu arquivo `.env`
   - Use diferentes secrets para dev/staging/prod
   - Rotacione secrets regularmente

2. **Atualizações**:
   - Mantenha dependências atualizadas
   - Monitore vulnerabilidades com `npm audit`
   - Execute `npm audit fix` regularmente

3. **Testes de Segurança**:
   - Execute testes de penetração
   - Use ferramentas como OWASP ZAP
   - Faça code review de segurança

## 🚨 Em Caso de Incidente

1. Troque imediatamente todas as credenciais
2. Revise logs de acesso
3. Notifique usuários se dados foram comprometidos
4. Documente o incidente
5. Implemente medidas para prevenir recorrência
