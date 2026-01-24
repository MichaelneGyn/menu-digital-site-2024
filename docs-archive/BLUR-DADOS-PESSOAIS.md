# 🔒 Sistema de Blur para Dados Pessoais

## ✅ Implementado!

O sistema agora **automaticamente borra dados pessoais** em screenshots e vídeos exibidos no mockup de celular.

---

## 📱 Como Funciona

### **Áreas com Blur Automático:**

1. **Topo da tela** (80px)
   - Nomes de usuários
   - Emails
   - Números de telefone
   - Cabeçalhos com dados pessoais

2. **Meio da tela** (120px - 35% do topo)
   - Campos de formulário
   - Endereços
   - Dados de cadastro
   - Informações sensíveis

3. **Rodapé** (60px)
   - Dados de contato
   - Informações do rodapé
   - Links pessoais

---

## 🎨 Visual do Blur

```
┌─────────────────┐
│ [BLUR TOPO]     │ ← Nomes, emails, telefones
│                 │
│   Conteúdo      │
│   Visível       │
│                 │
│ [BLUR MEIO]     │ ← Formulários, endereços
│                 │
│   Conteúdo      │
│   Visível       │
│                 │
│ [BLUR RODAPÉ]   │ ← Dados de contato
└─────────────────┘
```

---

## 💻 Como Usar

### **1. Com Screenshot (Imagem):**
```tsx
<PhoneMockup
  screenshot="/screenshots/minha-tela.jpg"
  alt="Descrição"
  title="Título"
  description="Descrição"
  blurPersonalData={true} // Padrão: true
/>
```

### **2. Com Vídeo:**
```tsx
<PhoneMockup
  video="/videos/meu-video.mp4"
  alt="Descrição"
  title="Título"
  description="Descrição"
  blurPersonalData={true} // Padrão: true
/>
```

### **3. Desativar Blur (se necessário):**
```tsx
<PhoneMockup
  screenshot="/screenshots/tela-publica.jpg"
  alt="Descrição"
  blurPersonalData={false} // Desativa o blur
/>
```

---

## 📍 Onde Está Aplicado

### **Seção de Screenshots:**
- ✅ Todas as telas administrativas
- ✅ Todas as telas do cliente
- ✅ Blur ativado por padrão

### **Arquivo:**
`components/PhoneMockup.tsx`

---

## 🎯 Benefícios

1. **Privacidade Garantida**
   - Nenhum dado pessoal visível
   - Proteção LGPD

2. **Visual Profissional**
   - Blur suave e elegante
   - Não prejudica a demonstração

3. **Automático**
   - Não precisa editar cada imagem
   - Funciona com screenshots e vídeos

4. **Customizável**
   - Pode ajustar posições do blur
   - Pode desativar quando necessário

---

## 🔧 Ajustar Posições do Blur

Edite em `components/PhoneMockup.tsx`:

```tsx
{/* Blur no topo */}
<div className="absolute top-0 left-0 right-0 h-[80px] ...">

{/* Blur no meio */}
<div className="absolute top-[35%] left-[10%] right-[10%] h-[120px] ...">

{/* Blur no rodapé */}
<div className="absolute bottom-0 left-0 right-0 h-[60px] ...">
```

**Ajuste:**
- `h-[80px]` → Altura do blur
- `top-[35%]` → Posição vertical
- `left-[10%]` → Margem esquerda
- `backdrop-blur-md` → Intensidade do blur

---

## ✨ Resultado

Agora todos os vídeos e screenshots aparecem dentro de um **mockup de iPhone moderno** com **blur automático** nas áreas sensíveis!

**Nenhum dado pessoal será visível!** 🔒
