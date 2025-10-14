# 📸 COMO CONFIGURAR CLOUDINARY PARA UPLOAD DE IMAGENS

Upload de imagens REAL com suas próprias fotos! ✅

---

## 🎯 POR QUE CLOUDINARY?

```
✅ 25 GB grátis (storage)
✅ 25 GB grátis (bandwidth/mês)
✅ Otimização automática de imagens
✅ Resize on-the-fly
✅ CDN global incluso
✅ Suporta 2000+ clientes/mês fácil
✅ Mais simples que AWS S3
```

---

## 📝 PASSO 1: CRIAR CONTA (5 minutos)

1. Acesse: https://cloudinary.com/users/register/free
2. Preencha:
   - Email
   - Senha  
   - Nome
3. Confirme email
4. ✅ Conta criada!

---

## 🔑 PASSO 2: PEGAR CREDENCIAIS

1. Faça login: https://cloudinary.com
2. Dashboard → **Account Details** (canto inferior esquerdo)
3. Copie e **GUARDE** estas 3 informações:

```
✅ Cloud name: exemplo-cloud-123
✅ API Key: 123456789012345
✅ API Secret: AbCdEfGhIjKlMnOpQrStUvWxYz
```

⚠️ **NUNCA COMPARTILHE O API SECRET!**

---

## ⚙️ PASSO 3: ADICIONAR NO VERCEL

1. Acesse: https://vercel.com/dashboard
2. Clique no seu projeto
3. **Settings** → **Environment Variables**
4. Adicione estas 3 variáveis:

| Nome da Variável | Valor | Ambiente |
|------------------|-------|----------|
| `CLOUDINARY_CLOUD_NAME` | seu-cloud-name | Production, Preview, Development |
| `CLOUDINARY_API_KEY` | sua-api-key | Production, Preview, Development |
| `CLOUDINARY_API_SECRET` | seu-api-secret | Production, Preview, Development |

5. Clique "Save" em cada uma

---

## 🚀 PASSO 4: INSTALAR DEPENDÊNCIAS

No terminal do seu projeto:

```bash
npm install cloudinary @supabase/supabase-js
```

---

## 📦 PASSO 5: FAZER DEPLOY

```bash
git add .
git commit -m "feat: add Cloudinary upload support"
git push origin master
```

Aguarde 2-3 minutos para o Vercel fazer deploy.

---

## 🧪 PASSO 6: TESTAR!

1. Aguarde deploy terminar no Vercel
2. Acesse seu dashboard
3. **Adicionar produto**
4. **Escolha uma imagem do seu PC** (sua foto real!)
5. Preencha dados + customizações
6. **Salvar**
7. ✅ **Imagem vai para Cloudinary!**
8. ✅ **Produto criado com SUA FOTO!**

---

## 🔍 VERIFICAR SE FUNCIONOU

### No Cloudinary Dashboard:

```
1. https://cloudinary.com/console
2. Menu **Media Library**
3. Pasta "menu-digital"
4. ✅ Suas fotos devem aparecer lá!
```

### No seu site:

```
1. Acesse o cardápio
2. Veja o produto criado
3. ✅ Foto real aparece!
4. ✅ Otimizada automaticamente!
```

---

## 📊 MONITORAR USO

1. https://cloudinary.com/console
2. Dashboard → **Usage**
3. Veja:
   - Storage usado
   - Bandwidth usado
   - Transformations

**Limite Free:** 25 GB storage + 25 GB bandwidth/mês

---

## 🎯 BENEFÍCIOS AUTOMÁTICOS

```
✅ Imagens são comprimidas automaticamente
✅ Formato otimizado (WebP se suportado)
✅ Tamanho máximo limitado (1200x1200)
✅ CDN global (entrega rápida mundial)
✅ Cache inteligente
✅ Qualidade automática
```

---

## ⚡ PRIORIDADE DE UPLOAD

O sistema tenta nesta ordem:

```
1. Cloudinary (se configurado) ← RECOMENDADO!
2. Supabase Storage (fallback)
3. AWS S3 (fallback)
4. Local (só desenvolvimento)
5. Unsplash (último recurso)
```

---

## 🔧 TROUBLESHOOTING

### Erro: "Cloudinary não configurado"

```
✅ Verifique se adicionou as 3 variáveis no Vercel
✅ Verifique se não tem espaços extras
✅ Redeploy no Vercel
```

### Erro: "Invalid API key"

```
✅ Copie API Key novamente do Cloudinary
✅ Cole corretamente no Vercel
✅ Redeploy
```

### Upload funciona mas imagem não aparece

```
✅ Verifique se bucket está público
✅ Cloudinary → Settings → Security
✅ "Delivery type" deve ser "Public"
```

---

## 💰 CUSTOS

```
Plano Free: R$ 0,00/mês
- 25 GB storage
- 25 GB bandwidth/mês
- 25.000 transformations/mês
- ✅ Suficiente para 2000+ clientes!

Plano Plus: $89/mês (se precisar)
- 100 GB storage
- 100 GB bandwidth/mês
- 100.000 transformations/mês
```

---

## 🎉 PRONTO!

Agora você tem upload de imagens REAL funcionando!

```
✅ Fotos dos SEUS produtos
✅ Otimizadas automaticamente
✅ CDN global
✅ 25 GB grátis
✅ Suporta milhares de clientes
```

---

## 📞 PRECISA DE AJUDA?

Se tiver dúvidas, me avise! Posso ajudar com qualquer passo! 🚀
