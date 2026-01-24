# 🚀 COMO ATIVAR O NOVO MODAL DE PERSONALIZAÇÃO

## ⚡ ATIVAÇÃO RÁPIDA (2 MINUTOS)

### **PASSO 1: Abrir o arquivo**
```
components/menu/product-card.tsx
```

### **PASSO 2: Trocar o import**

**Linha 7 - ANTES:**
```tsx
import ProductCustomizationModalDynamic from './product-customization-modal-dynamic';
```

**Linha 7 - DEPOIS:**
```tsx
import ProductCustomizationModalImproved from './product-customization-modal-improved';
```

### **PASSO 3: Trocar o componente**

**Linha 126 - ANTES:**
```tsx
<ProductCustomizationModalDynamic
  item={item}
  onAdd={handleCustomizedAdd}
  onClose={() => setShowCustomizationModal(false)}
/>
```

**Linha 126 - DEPOIS:**
```tsx
<ProductCustomizationModalImproved
  item={item}
  onAdd={handleCustomizedAdd}
  onClose={() => setShowCustomizationModal(false)}
/>
```

### **PASSO 4: Salvar e testar**
- Salve o arquivo
- Recarregue o site
- Clique em um produto personalizável
- Veja a nova interface! 🎉

---

## 🔄 ALTERNATIVA: TESTAR SEM SUBSTITUIR

Se quiser testar sem remover o antigo:

### **1. Adicione uma flag no topo do arquivo:**
```tsx
const USE_NEW_CUSTOMIZATION_MODAL = true; // Mude para false para voltar ao antigo
```

### **2. Use condicional:**
```tsx
{showCustomizationModal && hasCustomizations && (
  USE_NEW_CUSTOMIZATION_MODAL ? (
    <ProductCustomizationModalImproved
      item={item}
      onAdd={handleCustomizedAdd}
      onClose={() => setShowCustomizationModal(false)}
    />
  ) : (
    <ProductCustomizationModalDynamic
      item={item}
      onAdd={handleCustomizedAdd}
      onClose={() => setShowCustomizationModal(false)}
    />
  )
)}
```

### **3. Importe os dois:**
```tsx
import ProductCustomizationModalDynamic from './product-customization-modal-dynamic';
import ProductCustomizationModalImproved from './product-customization-modal-improved';
```

---

## ✅ CHECKLIST DE TESTE:

Depois de ativar, teste:

### **Pizza:**
- [ ] Selecionar tamanho
- [ ] Selecionar sabores (até o limite)
- [ ] Adicionar extras
- [ ] Escrever observações
- [ ] Ver preço calculado corretamente
- [ ] Adicionar ao carrinho

### **Sanduíche/Burger:**
- [ ] Remover ingredientes incluídos
- [ ] Adicionar ingredientes extras
- [ ] Ver preço dos extras
- [ ] Escrever observações
- [ ] Adicionar ao carrinho

### **Mobile:**
- [ ] Abrir em celular
- [ ] Testar todos os passos
- [ ] Verificar responsividade
- [ ] Testar botão voltar

---

## 🐛 SE DER ERRO:

### **Erro: "Cannot find module"**
**Solução:** Verifique se o arquivo `product-customization-modal-improved.tsx` está na pasta `components/menu/`

### **Erro: "Type mismatch"**
**Solução:** O novo modal usa a mesma interface `ProductCustomization` do antigo, deve funcionar sem problemas.

### **Erro: "Preço não calcula"**
**Solução:** Verifique se o `item.price` está vindo como número no banco de dados.

---

## 🎯 PRÓXIMA ETAPA:

Depois de testar e aprovar, vamos:
1. Integrar com banco de dados (buscar sabores/extras dinâmicos)
2. Adicionar fotos dos produtos
3. Adicionar mais opções de personalização

---

**Quer que eu faça a substituição para você?** 
Posso editar o arquivo `product-card.tsx` agora mesmo! 🚀
