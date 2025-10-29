# 🎬 COMO ADICIONAR VÍDEOS NOS TUTORIAIS

## ✅ **CORREÇÕES FEITAS:**

1. ✅ **YouTube permitido** no CSP (Content Security Policy)
2. ✅ **Página de tutoriais criada** em `/admin/tutoriais`
3. ✅ **Thumbnails automáticas** do YouTube
4. ✅ **Player embutido** funcionando

---

## 📋 **PASSO A PASSO:**

### **1. FAZER UPLOAD DOS VÍDEOS NO YOUTUBE:**

1. Acesse: https://studio.youtube.com
2. Clique em "Criar" → "Enviar vídeo"
3. Faça upload dos 11 vídeos
4. Configure cada vídeo:
   - **Visibilidade:** "Não listado" (recomendado) ou "Público"
   - **Título:** Nome claro (ex: "Como Adicionar Item - Menu Digital")
   - **Descrição:** Breve explicação

---

### **2. PEGAR OS IDs DOS VÍDEOS:**

Depois do upload, cada vídeo terá uma URL assim:

```
https://youtube.com/watch?v=ABC123XYZ456
                           ↑
                    Este é o VIDEO_ID
```

**Exemplo:**
- URL: `https://youtube.com/watch?v=dQw4w9WgXcQ`
- ID: `dQw4w9WgXcQ`

---

### **3. ATUALIZAR O ARQUIVO:**

Abra o arquivo:
```
app/admin/tutoriais/page.tsx
```

Procure pela linha **32** onde começa a lista de tutoriais:

```typescript
const tutoriais: Tutorial[] = [
  {
    id: '1',
    title: 'Cadastro e Login',
    description: 'Aprenda a criar sua conta e fazer login no sistema',
    videoId: 'SEU_VIDEO_ID_AQUI', // ← SUBSTITUA AQUI
    duration: '2:30',
    category: 'Primeiros Passos',
  },
  // ... mais tutoriais
];
```

**Substitua** `'SEU_VIDEO_ID_AQUI'` pelo ID real do YouTube.

---

### **4. EXEMPLO COMPLETO:**

**ANTES:**
```typescript
{
  id: '1',
  title: 'Cadastro e Login',
  videoId: 'SEU_VIDEO_ID_AQUI',
  duration: '2:30',
  category: 'Primeiros Passos',
},
```

**DEPOIS:**
```typescript
{
  id: '1',
  title: 'Cadastro e Login',
  videoId: 'dQw4w9WgXcQ', // ← ID real do YouTube
  duration: '2:30',
  category: 'Primeiros Passos',
},
```

---

### **5. LISTA DE VÍDEOS PARA ATUALIZAR:**

Você tem 11 vídeos para adicionar:

1. **Cadastro e Login** → `videoId: '???'`
2. **Configurações Iniciais** → `videoId: '???'`
3. **Criar Categoria** → `videoId: '???'`
4. **Adicionar Item** → `videoId: '???'`
5. **Criar Cupom** → `videoId: '???'`
6. **Criar Upsell** → `videoId: '???'`
7. **Configurações Gerais** → `videoId: '???'`
8. **Painel de Comandas - Parte 1** → `videoId: '???'`
9. **Painel de Comandas - Parte 2** → `videoId: '???'`
10. **Gestão de Mesas** → `videoId: '???'`
11. **Chamadas - Acionar Garçom** → `videoId: '???'`

---

### **6. AJUSTAR DURAÇÕES (OPCIONAL):**

Se quiser, atualize o campo `duration` com o tempo real de cada vídeo:

```typescript
duration: '2:30', // 2 minutos e 30 segundos
```

---

### **7. FAZER COMMIT E PUSH:**

Depois de atualizar todos os IDs:

```powershell
git add app/admin/tutoriais/page.tsx next.config.js app/admin/dashboard/page.tsx
git commit -m "feat: tutoriais com vídeos do YouTube integrados"
git push origin master
```

---

## 🎯 **ACESSAR A PÁGINA:**

Depois do deploy, acesse:

```
https://seu-site.com/admin/tutoriais
```

Ou adicione um link no menu/sidebar manualmente.

---

## 💡 **DICAS:**

### **Thumbnails Automáticas:**
O sistema pega automaticamente as thumbnails do YouTube:
```
https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
```

### **Categorias:**
Os vídeos são organizados por categoria:
- Primeiros Passos
- Cardápio
- Promoções
- Vendas
- Configurações
- Pedidos
- Atendimento

### **Busca:**
Seus clientes podem buscar por título ou descrição!

---

## 🚀 **PRONTO!**

Depois de atualizar os IDs e fazer push, os vídeos vão aparecer lindos na página de tutoriais! 🎉

---

## 📞 **PRECISA DE AJUDA?**

Se tiver dúvida, me chama que eu te ajudo a adicionar os IDs!
