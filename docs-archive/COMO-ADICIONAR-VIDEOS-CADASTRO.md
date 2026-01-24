# 🎥 Como Adicionar Vídeos/GIFs na Página de Cadastro

## 📍 Localização dos Placeholders

A nova página de cadastro tem **2 áreas** para vídeos/GIFs:

### 1️⃣ **Coluna Esquerda** (Linhas 112-123)
- Tema: "Como funciona"
- Cor: Laranja
- Sugestão: Vídeo mostrando o sistema em ação

### 2️⃣ **Coluna Direita** (Linhas 272-283)
- Tema: "Resultados reais"
- Cor: Verde
- Sugestão: Vídeo de depoimento ou dashboard

---

## 🎬 Opção 1: Adicionar GIF

### Passo 1: Converter vídeo para GIF
Use um desses sites:
- https://ezgif.com/video-to-gif
- https://cloudconvert.com/mp4-to-gif

**Configurações recomendadas:**
- Tamanho: 800x450px (16:9)
- FPS: 10-15
- Qualidade: Média (para não ficar pesado)

### Passo 2: Salvar o GIF
Coloque na pasta: `public/videos/`
- Exemplo: `public/videos/como-funciona.gif`
- Exemplo: `public/videos/resultados.gif`

### Passo 3: Substituir o código

**Coluna Esquerda (linha 112-123):**
```tsx
<div className="aspect-video bg-white rounded-xl flex items-center justify-center mb-4 overflow-hidden">
  <img 
    src="/videos/como-funciona.gif" 
    alt="Como funciona o sistema"
    className="w-full h-full object-cover"
  />
</div>
```

**Coluna Direita (linha 272-283):**
```tsx
<div className="aspect-video bg-white rounded-xl flex items-center justify-center mb-4 overflow-hidden">
  <img 
    src="/videos/resultados.gif" 
    alt="Resultados reais"
    className="w-full h-full object-cover"
  />
</div>
```

---

## 🎥 Opção 2: Adicionar Vídeo MP4 (Melhor qualidade)

### Passo 1: Otimizar o vídeo
- Duração: 5-15 segundos
- Resolução: 1280x720 (HD)
- Formato: MP4
- Codec: H.264

Use: https://www.freeconvert.com/video-compressor

### Passo 2: Salvar o vídeo
Coloque na pasta: `public/videos/`
- Exemplo: `public/videos/demo.mp4`
- Exemplo: `public/videos/dashboard.mp4`

### Passo 3: Substituir o código

**Coluna Esquerda:**
```tsx
<div className="aspect-video bg-white rounded-xl overflow-hidden mb-4">
  <video 
    autoPlay 
    loop 
    muted 
    playsInline
    className="w-full h-full object-cover"
  >
    <source src="/videos/demo.mp4" type="video/mp4" />
  </video>
</div>
```

**Coluna Direita:**
```tsx
<div className="aspect-video bg-white rounded-xl overflow-hidden mb-4">
  <video 
    autoPlay 
    loop 
    muted 
    playsInline
    className="w-full h-full object-cover"
  >
    <source src="/videos/dashboard.mp4" type="video/mp4" />
  </video>
</div>
```

---

## 📱 Opção 3: Vídeo do YouTube (Embed)

### Passo 1: Pegar o ID do vídeo
- URL: `https://www.youtube.com/watch?v=ABC123`
- ID: `ABC123`

### Passo 2: Substituir o código

```tsx
<div className="aspect-video bg-white rounded-xl overflow-hidden mb-4">
  <iframe
    src="https://www.youtube.com/embed/ABC123?autoplay=1&mute=1&loop=1&playlist=ABC123&controls=0"
    className="w-full h-full"
    allow="autoplay; encrypted-media"
    allowFullScreen
  />
</div>
```

---

## 💡 Sugestões de Conteúdo

### Vídeo 1 (Esquerda - Laranja):
- ✅ Tour rápido pelo sistema
- ✅ Como adicionar produtos
- ✅ Como receber pedidos
- ✅ Interface do cardápio

### Vídeo 2 (Direita - Verde):
- ✅ Dashboard de vendas
- ✅ Relatórios em tempo real
- ✅ Depoimento de cliente
- ✅ Comparação antes/depois

---

## 🚀 Melhorias Implementadas

### ✅ Removido campo "Nome do Restaurante"
- Agora só pede: WhatsApp, Email e Senha
- Cadastro mais rápido (30 segundos)

### ✅ Design moderno com 3 colunas
- **Esquerda**: Benefícios + Vídeo 1
- **Centro**: Formulário de cadastro
- **Direita**: Oferta especial + Vídeo 2

### ✅ Informações adicionadas
- Por que escolher (4 benefícios)
- Oferta especial (R$ 34,95 vitalício)
- O que está incluso (5 recursos)
- Garantia de 30 dias

### ✅ Mobile responsivo
- Em telas pequenas, mostra só o formulário
- Laterais aparecem apenas em desktop (lg+)

---

## 📝 Próximos Passos

1. **Grave seus vídeos** (5-15 segundos cada)
2. **Converta para GIF ou MP4** (use os sites acima)
3. **Salve em** `public/videos/`
4. **Substitua o código** nos placeholders
5. **Teste no navegador**

---

## ❓ Dúvidas?

Se precisar de ajuda para:
- Editar os vídeos
- Converter formatos
- Ajustar o código

É só me avisar! 🚀
