# 🔔 GUIA DE NOTIFICAÇÕES DO SISTEMA

## ✅ Sistema configurado com **Sonner** (React Toast)

Todas as ações importantes do sistema agora mostram notificações visuais!

---

## 📋 TIPOS DE NOTIFICAÇÕES

### 1️⃣ **SUCESSO (Verde)** ✅
```typescript
import { toast } from 'sonner';

toast.success('Item criado com sucesso!');
toast.success('Restaurante atualizado!', {
  description: 'Suas alterações foram salvas.'
});
```

### 2️⃣ **ERRO (Vermelho)** ❌
```typescript
toast.error('Erro ao criar item!');
toast.error('Falha no upload', {
  description: 'Tente novamente em alguns instantes.'
});
```

### 3️⃣ **AVISO (Amarelo)** ⚠️
```typescript
toast.warning('Atenção!');
toast.warning('Campos obrigatórios', {
  description: 'Preencha todos os campos antes de continuar.'
});
```

### 4️⃣ **INFO (Azul)** ℹ️
```typescript
toast.info('Bem-vindo ao sistema!');
toast.info('Dica', {
  description: 'Você pode adicionar até 100 produtos.'
});
```

### 5️⃣ **LOADING / PROMISE** ⏳
```typescript
toast.promise(
  fetch('/api/items'),
  {
    loading: 'Salvando...',
    success: 'Item salvo com sucesso!',
    error: 'Erro ao salvar item'
  }
);
```

---

## 🎨 PERSONALIZAÇÃO

### Duração customizada:
```typescript
toast.success('Mensagem rápida!', { duration: 2000 }); // 2 segundos
```

### Com ação:
```typescript
toast.success('Item deletado', {
  action: {
    label: 'Desfazer',
    onClick: () => console.log('Desfazer')
  }
});
```

### Sem fechar automaticamente:
```typescript
toast.error('Erro crítico!', { duration: Infinity });
```

---

## 📍 ONDE AS NOTIFICAÇÕES APARECEM

- **Posição:** Top-right (canto superior direito)
- **Duração padrão:** 4 segundos
- **Botão fechar:** ✕ sempre visível
- **Mobile:** Centralizado e responsivo

---

## ✅ AÇÕES QUE JÁ TÊM NOTIFICAÇÕES

### Dashboard Admin:
- ✅ Criar restaurante
- ✅ Editar restaurante
- ✅ Adicionar item
- ✅ Deletar item
- ✅ Criar categoria
- ✅ Upload de imagem
- ✅ Importar em massa
- ✅ Atualizar personalização

### Login/Auth:
- ✅ Login bem-sucedido
- ✅ Erro de autenticação
- ✅ Senha incorreta

### Pedidos:
- ✅ Pedido criado
- ✅ Status atualizado
- ✅ Pedido cancelado

---

## 🧪 TESTAR NOTIFICAÇÕES

### No Console do navegador (F12):
```javascript
// Importar toast (já está disponível globalmente)
import { toast } from 'sonner';

// Testar:
toast.success('✅ Teste de sucesso!');
toast.error('❌ Teste de erro!');
toast.warning('⚠️ Teste de aviso!');
toast.info('ℹ️ Teste de info!');
```

---

## 🎯 EXEMPLOS PRÁTICOS

### Login bem-sucedido:
```typescript
toast.success('🎉 Login realizado!', {
  description: `Bem-vindo, ${user.name}!`
});
```

### Upload de imagem:
```typescript
toast.promise(
  uploadImage(file),
  {
    loading: '📤 Enviando imagem...',
    success: '✅ Imagem enviada com sucesso!',
    error: '❌ Erro no upload. Tente novamente.'
  }
);
```

### Criar produto:
```typescript
const response = await fetch('/api/items', { method: 'POST', ... });

if (response.ok) {
  toast.success('🍕 Produto adicionado!', {
    description: 'Seu produto já está visível no cardápio.'
  });
} else {
  toast.error('❌ Erro ao adicionar produto');
}
```

---

## 🚀 RESULTADO

Agora **TODAS as ações** mostram feedback visual:
- ✅ Sem precisar abrir F12
- ✅ Visível e bonito
- ✅ Animações suaves
- ✅ Cores diferenciadas por tipo
- ✅ Responsivo (mobile e desktop)

---

**Teste agora fazendo qualquer ação no dashboard!** 🎉
