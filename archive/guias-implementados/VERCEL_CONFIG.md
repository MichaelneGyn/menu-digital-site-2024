# Configuração do Vercel

## Variáveis de Ambiente Necessárias

Para que o site funcione corretamente no Vercel, você precisa configurar as seguintes variáveis de ambiente no painel do Vercel:

### 1. Database
```
DATABASE_URL=postgresql://neondb_owner:npg_yNdZ2kQMiz7K@ep-bold-waterfall-acoz96nv-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 2. NextAuth
```
NEXTAUTH_URL=https://SEU-SITE.vercel.app
NEXTAUTH_SECRET=33cbd2963f38c21eb822a6645a922fe43926e458712cccf22927fce16fc7f6e1
```

**IMPORTANTE:** Substitua `SEU-SITE` pela URL real do seu projeto no Vercel.

### 3. AWS (se usando upload de imagens)
```
AWS_PROFILE=default
AWS_REGION=us-west-2
AWS_BUCKET_NAME=menu-digital-uploads
AWS_FOLDER_PREFIX=uploads/
```

## Como Configurar no Vercel

1. Acesse o painel do Vercel
2. Vá para o seu projeto
3. Clique em "Settings"
4. Clique em "Environment Variables"
5. Adicione cada variável listada acima
6. **IMPORTANTE:** Após adicionar as variáveis, faça um **REDEPLOY** completo
   - Vá para "Deployments"
   - Clique nos três pontos do último deploy
   - Selecione "Redeploy"

## Correções Implementadas

### ✅ Problemas Resolvidos:
1. **trustHost: true** adicionado ao NextAuth
2. **Callback de redirect** personalizado
3. **Middleware** criado para melhor controle de auth
4. **Favicon** criado para resolver 404

### 🔧 Arquivos Modificados:
- `lib/auth.ts` - Configurações de produção
- `middleware.ts` - Novo arquivo para controle de auth
- `public/favicon.ico` - Favicon criado

## Problemas Comuns

### Erro 401 em /api/auth/callback/credentials
- **Causa:** NEXTAUTH_URL não configurado ou trustHost não definido
- **Solução:** ✅ Configurado trustHost: true e callback de redirect

### Erro 404 em favicon.ico
- **Status:** ✅ Resolvido - favicon.ico criado em /public/

### Se os erros persistirem:
1. Verifique se NEXTAUTH_URL está EXATAMENTE igual à URL do Vercel
2. Faça um redeploy completo após configurar as variáveis
3. Limpe o cache do navegador
4. Verifique os logs do Vercel para erros específicos