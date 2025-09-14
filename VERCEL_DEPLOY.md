# Deploy no Vercel - Menu Digital

## 📋 Pré-requisitos

- Conta no Vercel
- Repositório Git (GitHub, GitLab ou Bitbucket)
- Banco de dados Supabase configurado

## 🚀 Passos para Deploy

### 1. Preparar o Repositório

```bash
# Fazer commit de todas as alterações
git add .
git commit -m "Preparar para deploy no Vercel"
git push origin main
```

### 2. Configurar Variáveis de Ambiente no Vercel

No painel do Vercel, adicione as seguintes variáveis de ambiente:

#### Banco de Dados
```
DATABASE_URL=postgresql://postgres:Mdqs%40%402590%23@db.ludfeemuwrxjhiqcjywx.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:Mdqs%40%402590%23@db.ludfeemuwrxjhiqcjywx.supabase.co:5432/postgres
```

#### NextAuth
```
NEXTAUTH_SECRET=33cbd2963f38c21eb822a6645a922fe43926e458712cccf22927fce16fc7f6e1
NEXTAUTH_URL=https://seu-dominio.vercel.app
```

#### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://ludfeemuwrxjhiqcjywx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1ZGZlZW11d3J4amhpcWNqeXd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MDQ1MjgsImV4cCI6MjA3MzM4MDUyOH0.nUZyvOBFoqB3B5ZVJycmANtSm9Ii2bdsjN01VWbHEI0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1ZGZlZW11d3J4amhpcWNqeXd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzgwNDUyOCwiZXhwIjoyMDczMzgwNTI4fQ.T7MJcQ86vx979qqR12bwMhbXZ4JnjfT1o6hY-cp7BIs
```

### 3. Configurações de Build

O projeto já está configurado com:
- `vercel.json` com configurações otimizadas
- `next.config.js` com configurações para produção
- Scripts de build no `package.json`

### 4. Deploy Automático

1. Conecte seu repositório ao Vercel
2. O Vercel detectará automaticamente que é um projeto Next.js
3. Configure as variáveis de ambiente
4. Clique em "Deploy"

### 5. Configurações Pós-Deploy

#### Domínio Personalizado (Opcional)
1. Vá para Settings > Domains
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruções

#### Monitoramento
- Verifique os logs de build e runtime
- Teste todas as funcionalidades
- Configure alertas se necessário

## 🔧 Troubleshooting

### Erro de Banco de Dados
- Verifique se a `DATABASE_URL` está correta
- Confirme que o banco Supabase está acessível
- Verifique se o Prisma está gerando corretamente

### Erro de Build
- Verifique se todas as dependências estão no `package.json`
- Confirme que não há erros de TypeScript
- Verifique os logs de build no Vercel

### Erro de Runtime
- Verifique as variáveis de ambiente
- Confirme que todas as APIs estão funcionando
- Verifique os logs de função no Vercel

## 📝 Comandos Úteis

```bash
# Testar build localmente
npm run build
npm start

# Verificar dependências
npm audit
npm update

# Gerar Prisma
npx prisma generate
npx prisma db push
```

## 🌐 URLs Importantes

- **Produção**: https://menu-digital-site-urfhx.vercel.app
- **Supabase**: https://ludfeemuwrxjhiqcjywx.supabase.co
- **Vercel Dashboard**: https://vercel.com/dashboard

## ✅ Checklist Final

- [ ] Todas as variáveis de ambiente configuradas
- [ ] Build local funcionando
- [ ] Banco de dados acessível
- [ ] Domínio configurado (se aplicável)
- [ ] Funcionalidades testadas em produção
- [ ] Monitoramento configurado

---

**Nota**: Sempre teste em um ambiente de staging antes de fazer deploy em produção!