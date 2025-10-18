# 🔒 AUDITORIA COMPLETA DE SEGURANÇA - MENU DIGITAL
**Data:** 18/10/2025 15:25  
**Escopo:** Frontend + Backend + Infraestrutura

---

## 🚨 VULNERABILIDADES CRÍTICAS ENCONTRADAS

### ❌ **CRÍTICO 1: Exposição de SERVICE_ROLE_KEY no Código**

**Local:** `app/api/upload/route.ts:80`

```typescript
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
```

**Problema:**
- Se SERVICE_ROLE_KEY não estiver definida, usa ANON_KEY
- ANON_KEY é pública e exposta no frontend
- Permite uploads sem autenticação adequada

**Risco:** 🔴 CRÍTICO
- Qualquer pessoa com ANON_KEY pode fazer uploads
- Bypass de autenticação

**Correção:**
```typescript
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada');
}
```

---

### ❌ **CRÍTICO 2: PATCH /api/orders/[id] Sem Validação Forte**

**Local:** `app/api/orders/[id]/route.ts`

**Problema:**
- API Key validação existe mas key padrão é fraca
- `'your-secret-key-change-this'` no código

**Risco:** 🔴 CRÍTICO  
- Se usuário não mudar a chave, sistema vulnerável

**Status:** ✅ Parcialmente corrigido (precisa configurar variável)

---

### ⚠️ **ALTO 3: Falta de Sanitização em Inputs JSON**

**Locais:** Múltiplas rotas API

**Problema:**
```typescript
const body = await request.json(); // SEM validação
const { name, email } = body; // Usa direto
```

**Arquivos afetados:**
- `auth/forgot-password/route.ts`
- `auth/reset-password/route.ts`  
- `restaurant/route.ts`
- `orders/[id]/route.ts`
- E mais 15+ rotas

**Risco:** 🟠 ALTO
- Possível NoSQL injection
- Dados mal-formados podem causar crashes
- XSS se dados forem renderizados

**Correção Necessária:**
- Usar Zod schema validation em TODAS as rotas
- Sanitizar strings antes de usar

---

### ⚠️ **ALTO 4: Rate Limiting Inconsistente**

**Problema:**
- Algumas rotas têm rate limiting
- Outras não têm

**Rotas SEM proteção:**
- `/api/health` ✅ (ok ser pública)
- `/api/geocode` ❌ (deve ter limite)
- `/api/coupons/validate` ❌ (pode ser abusada)
- `/api/orders/[id]` ❌ (GET público sem limite)

**Risco:** 🟠 ALTO
- DDoS possível
- Brute force em validação de cupons
- Scraping de dados

---

### ⚠️ **MÉDIO 5: CORS Muito Permissivo**

**Local:** `app/api/orders/create/route.ts`

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXTAUTH_URL || 'https://...',
};
```

**Problema:**
- Apenas um domínio permitido (correto)
- MAS outras rotas podem não ter CORS configurado

**Risco:** 🟡 MÉDIO
- Cross-origin attacks possíveis em rotas sem CORS

---

### ⚠️ **MÉDIO 6: Logs Expondo Informações Sensíveis**

**Locais:** Múltiplos arquivos

```typescript
console.log('📥 Dados recebidos:', body); // Pode conter senha!
console.log('Usuário:', user); // Pode conter email/telefone
```

**Risco:** 🟡 MÉDIO
- Logs podem vazar dados em produção
- Vercel logs são visíveis

**Correção:**
- Remover logs sensíveis em produção
- Usar logger próprio com níveis

---

### ⚠️ **MÉDIO 7: Falta de Headers de Segurança**

**Problema:**
- Sem Content-Security-Policy
- Sem X-Frame-Options
- Sem X-Content-Type-Options
- Sem Referrer-Policy

**Risco:** 🟡 MÉDIO
- Clickjacking possível
- XSS mais fácil
- MIME sniffing attacks

---

### ⚠️ **BAIXO 8: Variáveis de Ambiente no Frontend**

**Local:** `app/pedido/[id]/page.tsx`

```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

**Status:** ✅ OK (NEXT_PUBLIC_ é esperado ser público)

**Mas:** Verificar se não há chaves secretas com NEXT_PUBLIC_

---

## ✅ PONTOS POSITIVOS (JÁ SEGUROS)

### ✅ **1. Prisma ORM Protege SQL Injection**
- Todas as queries usam Prisma
- Zero SQL direto encontrado

### ✅ **2. NextAuth Configurado Corretamente**
- 28 rotas protegidas com `getServerSession`
- Verificação de roles implementada

### ✅ **3. Validação de Arquivos Robusta**
- Magic numbers validation
- Tipo MIME check
- Tamanho máximo
- Extensão whitelist

### ✅ **4. Rate Limiting em Rotas Críticas**
- `/api/orders/create` ✅
- `/api/upload` ✅
- `/api/signup` ✅
- `/api/auth/*` ✅

### ✅ **5. Sem eval() ou dangerouslySetInnerHTML**
- Código não usa funções perigosas

### ✅ **6. HTTPS Forçado no Vercel**
- Deploy automático com TLS

### ✅ **7. Dados Sensíveis Mascarados (LGPD)**
- Telefones e endereços mascarados em GET público
- Apenas primeiro nome exposto

---

## 📊 SCORE DE SEGURANÇA

```
╔═══════════════════════════════════════╗
║  SCORE ATUAL: 72/100                  ║
║  ██████████░░░░░░░░░░ BOM             ║
╚═══════════════════════════════════════╝

Breakdown:
✅ Autenticação:        9/10  (90%)
✅ Autorização:         8/10  (80%)
⚠️ Input Validation:    6/10  (60%)
⚠️ Rate Limiting:       7/10  (70%)
✅ SQL Injection:       10/10 (100%)
✅ XSS Protection:      9/10  (90%)
⚠️ Headers Segurança:   4/10  (40%)
✅ LGPD Compliance:     9/10  (90%)
⚠️ Logging Seguro:      5/10  (50%)
✅ Secrets Management:  7/10  (70%)
```

---

## 🔧 PLANO DE CORREÇÃO (PRIORIDADE)

### 🔴 **URGENTE (Fazer Agora)**

1. **Corrigir Fallback de ANON_KEY**
   - Arquivo: `app/api/upload/route.ts`
   - Tempo: 2 min

2. **Configurar ADMIN_API_KEY no Vercel**
   - Variável de ambiente
   - Tempo: 2 min

3. **Adicionar Rate Limiting em GET /api/orders/[id]**
   - Prevenir scraping
   - Tempo: 5 min

4. **Sanitizar Inputs em Forgot Password**
   - Email validation
   - Tempo: 5 min

### 🟠 **IMPORTANTE (Próximos 7 dias)**

5. **Adicionar Zod Validation em Todas as Rotas**
   - 20+ arquivos
   - Tempo: 2 horas

6. **Implementar CSP Headers**
   - next.config.js
   - Tempo: 30 min

7. **Remover Logs Sensíveis**
   - Buscar e substituir
   - Tempo: 1 hora

8. **Adicionar Rate Limiting Global**
   - Middleware
   - Tempo: 30 min

### 🟡 **RECOMENDADO (Próximo mês)**

9. **Implementar Logger Estruturado**
   - Winston ou Pino
   - Tempo: 3 horas

10. **Adicionar Testes de Segurança**
    - OWASP ZAP scan
    - Tempo: 4 horas

11. **Implementar WAF**
    - Cloudflare ou similar
    - Tempo: 2 horas

---

## 🛠️ CORREÇÕES AUTOMÁTICAS

Criei scripts para aplicar correções automaticamente:

### Script 1: `fix-critical-security.ts`
- Corrige ANON_KEY fallback
- Adiciona validações faltantes
- Remove logs sensíveis

### Script 2: `add-security-headers.js`
- Adiciona CSP
- Configura headers de segurança
- Atualiza next.config.js

### Script 3: `add-rate-limiting.ts`
- Adiciona rate limiting em rotas públicas
- Middleware global

---

## 🎯 META: SCORE 90/100

Para atingir 90/100, precisa:

```
□ Aplicar todas as correções URGENTES
□ Implementar 80% das correções IMPORTANTES
□ Configurar variáveis de ambiente corretamente
□ Fazer scan com OWASP ZAP
□ Passar em todos os testes de segurança
□ Documentar políticas de segurança
```

**Tempo estimado:** 6-8 horas de dev

---

## 📚 REFERÊNCIAS

- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **Next.js Security:** https://nextjs.org/docs/advanced-features/security-headers
- **Supabase RLS:** https://supabase.com/docs/guides/auth/row-level-security
- **LGPD:** Lei 13.709/2018

---

## ✅ CHECKLIST DE PRODUÇÃO

Antes de deploy em produção, verificar:

```
□ Todas as variáveis de ambiente configuradas
□ Chaves secretas NÃO expostas no código
□ RLS ativo no Supabase
□ Rate limiting em todas as rotas públicas
□ Zod validation em todas as APIs
□ Logs NÃO contêm dados sensíveis
□ Headers de segurança configurados
□ HTTPS forçado
□ Backup do banco configurado
□ Monitoramento (Sentry) ativo
```

---

**Última atualização:** 18/10/2025 15:25  
**Próxima auditoria:** 18/11/2025
