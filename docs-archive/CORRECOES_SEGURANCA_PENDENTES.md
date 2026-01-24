# 🔒 CORREÇÕES DE SEGURANÇA PENDENTES

## ⚠️ URGENTE (FAZER HOJE!)

### 1. Remover `.env.production` do Git
```bash
# PASSO 1: Remover do repositório
git rm --cached .env.production
git commit -m "security: remove sensitive env file from repository"
git push

# PASSO 2: Adicionar ao .gitignore
echo ".env.production" >> .gitignore
git add .gitignore
git commit -m "security: add .env.production to gitignore"
git push

# PASSO 3: Configurar TODAS as variáveis no Vercel Dashboard
# Vercel → Settings → Environment Variables:
DATABASE_URL=postgresql://postgres.vppvfgmkfrycktsulahd:Mbqsx%40%402590%21@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
NEXTAUTH_SECRET=f0yJSIQbwq7+NRCSHUNFb/52ZPF04KZBgxK0idkvx4I=
NEXTAUTH_URL=https://menu-digital-site-2024-8773d37d6064-git-main-michaeldouglasqueiroz.vercel.app
```

**Por quê é crítico:**
- ❌ Senha do banco está no Git (QUALQUER UM com acesso ao repo vê!)
- ❌ Se repo vazar, banco está comprometido
- ✅ Variáveis devem estar SÓ no Vercel Dashboard

---

### 2. Remover Logs Sensíveis de Produção

**Arquivo:** `lib/auth.ts`

**Adicionar no topo:**
```typescript
const isDev = process.env.NODE_ENV === 'development';
```

**Trocar TODOS os console.log:**
```typescript
// ANTES:
console.log('🔐 Tentativa de login:', { email: credentials?.email });

// DEPOIS:
if (isDev) {
  console.log('🔐 Tentativa de login:', { email: credentials?.email });
}
```

**Linhas para modificar:**
- Linha 31: Login attempt
- Linha 44: User found
- Linha 56: Password valid
- Linha 62: Login success

---

## 🟡 IMPORTANTE (FAZER ESTA SEMANA)

### 3. Adicionar Headers de Segurança

**Arquivo:** `next.config.js`

**Adicionar dentro de `async headers()`:**
```javascript
{
  source: '/:path*',
  headers: [
    {
      key: 'X-Frame-Options',
      value: 'DENY', // Previne clickjacking
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff', // Previne MIME sniffing
    },
    {
      key: 'Referrer-Policy',
      value: 'origin-when-cross-origin',
    },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=()',
    },
  ],
},
```

---

### 4. Adicionar Rate Limiting em Mais Rotas

**Rotas críticas que precisam:**
- `app/api/auth/forgot-password/route.ts`
- `app/api/auth/reset-password/route.ts`
- `app/api/subscription/confirm-payment/route.ts`

**Código para adicionar em CADA uma:**
```typescript
import { authRateLimiter } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // Rate limiting (5 tentativas por 15 minutos)
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
  const limitResult = authRateLimiter(ip);
  
  if (!limitResult.success) {
    return limitResult.response!;
  }
  
  // ... resto do código
}
```

---

### 5. Validar Tamanho do Body

**Arquivo:** `next.config.js`

**Adicionar:**
```javascript
api: {
  bodyParser: {
    sizeLimit: '10mb', // Limita tamanho de requisições
  },
},
```

---

## 🟢 BOAS PRÁTICAS (MELHORIAS FUTURAS)

### 6. Implementar CSRF Tokens

Para proteção extra contra Cross-Site Request Forgery.

**Biblioteca recomendada:**
```bash
npm install csrf
```

---

### 7. Implementar Webhook Signatures

Para pagamentos (PIX), validar assinatura do webhook:

```typescript
import crypto from 'crypto';

function validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

### 8. Monitoramento e Alertas

**Ferramentas recomendadas:**
- Sentry (erros e performance)
- LogRocket (sessões de usuário)
- Uptime Robot (monitorar se site caiu)

---

## 📊 CHECKLIST DE SEGURANÇA

### ✅ Feito:
- [x] Rate limiting em upload
- [x] Rate limiting em criação de pedidos
- [x] Restringir hostnames de imagens
- [x] Corrigir CORS
- [x] Validação de tipos de arquivo
- [x] Validação de tamanho de arquivo (5MB)
- [x] Magic numbers validation
- [x] Autenticação em rotas sensíveis

### ⏳ Pendente:
- [ ] Remover .env.production do Git
- [ ] Remover logs sensíveis de produção
- [ ] Adicionar headers de segurança
- [ ] Rate limiting em forgot/reset password
- [ ] Validar tamanho do body
- [ ] CSRF protection
- [ ] Webhook signatures
- [ ] Monitoramento

---

## 🚨 ORDEM DE PRIORIDADE:

1. **HOJE:** Remover .env.production do Git
2. **HOJE:** Remover logs sensíveis
3. **ESTA SEMANA:** Headers de segurança
4. **ESTA SEMANA:** Rate limiting em auth routes
5. **PRÓXIMA SPRINT:** CSRF e webhook signatures
6. **QUANDO ESCALAR:** Monitoramento profissional

---

## 📞 SUPORTE:

Se tiver dúvidas ao implementar qualquer correção, me chame!

**Documentação útil:**
- NextAuth: https://next-auth.js.org/configuration/options
- Rate Limiting: https://github.com/vercel/next.js/discussions/38255
- Security Headers: https://nextjs.org/docs/advanced-features/security-headers
