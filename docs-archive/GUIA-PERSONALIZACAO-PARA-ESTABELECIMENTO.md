# 🎨 GUIA: Personalização de Produtos

## 📋 **O QUE É?**

A **Personalização de Produtos** permite que você configure opções de customização para suas categorias (Pizzas, Hambúrgueres, Bebidas, etc.).

Seus clientes poderão escolher:
- **Tamanhos** (Pequena, Média, Grande)
- **Sabores** (Calabresa, Marguerita, Portuguesa)
- **Adicionais** (Borda Catupiry, Extra Bacon)

---

## 🚀 **COMO ACESSAR:**

### **Opção 1: Pelo Dashboard**
1. Faça login no painel administrativo
2. Na tela inicial, clique no card **"🎨 Personalização"** (com selo NOVO verde)

### **Opção 2: Pela URL**
Acesse diretamente:
```
https://seu-site.com.br/dashboard/customization
```

---

## 📝 **PASSO A PASSO:**

### **1️⃣ SELECIONAR CATEGORIA**

1. Na tela de Personalização, você verá um dropdown **"📁 Selecione uma Categoria"**
2. Clique e escolha a categoria que deseja personalizar (ex: Pizzas, Hambúrgueres)

---

### **2️⃣ ATIVAR PERSONALIZAÇÃO**

1. Marque o checkbox **"✨ Esta categoria é personalizável"**
2. Clique no botão verde **"Salvar Configuração"**
3. Aguarde a mensagem de sucesso

---

### **3️⃣ CONFIGURAR TAMANHOS** (Opcional)

#### **Quando usar:**
- Produtos que têm tamanhos diferentes (Pizza Pequena, Média, Grande)
- Bebidas (350ml, 600ml, 1L, 2L)

#### **Como configurar:**

1. **Ative o toggle "Tamanhos"** (ao lado do título)
2. **Adicione os tamanhos:**
   - **Nome:** Ex: "Média"
   - **Descrição:** Ex: "6 fatias"
   - **Multiplicador:** Ex: 1.0 (preço normal), 0.7 (30% mais barato), 1.3 (30% mais caro)
3. Clique no botão **"+"** para adicionar
4. Repita para cada tamanho

#### **Exemplo - Pizzas:**
```
Pequena  | 4 fatias  | 0.7x  (30% mais barata)
Média    | 6 fatias  | 1.0x  (preço normal)
Grande   | 8 fatias  | 1.3x  (30% mais cara)
Gigante  | 12 fatias | 1.6x  (60% mais cara)
```

---

### **4️⃣ CONFIGURAR SABORES/OPÇÕES** (Opcional)

#### **Quando usar:**
- Pizzas com múltiplos sabores
- Hambúrgueres com escolha de carne
- Massas com escolha de molho

#### **Como configurar:**

1. **Ative o toggle "Sabores/Opções"**
2. **Configure o máximo de sabores:**
   - Ex: Pizza com até **2 sabores**
   - Ex: Hambúrguer com **1 tipo de carne**
3. **Adicione os sabores:**
   - **Nome:** Ex: "Calabresa"
   - **Preço:** Ex: R$ 35,00
4. Clique no botão **"+"** para adicionar
5. Repita para cada sabor

#### **Exemplo - Pizzas:**
```
Calabresa           | R$ 35,00
Marguerita          | R$ 32,00
Portuguesa          | R$ 38,00
4 Queijos           | R$ 36,00
Frango c/ Catupiry  | R$ 37,00
```

#### **Como funciona o preço:**
- Cliente escolhe **1 sabor:** Paga o preço daquele sabor
- Cliente escolhe **2 sabores:** Paga a **média** dos dois preços
  - Ex: Calabresa (R$ 35) + Marguerita (R$ 32) = R$ 33,50

---

### **5️⃣ CONFIGURAR ADICIONAIS** (Opcional)

#### **Quando usar:**
- Bordas especiais (Catupiry, Cheddar)
- Extras (Bacon, Queijo Extra)
- Complementos (Molhos, Coberturas)

#### **Como configurar:**

1. **Ative o toggle "Adicionais"**
2. **Adicione os adicionais:**
   - **Nome:** Ex: "Borda Catupiry"
   - **Preço:** Ex: R$ 5,00 (valor adicional)
3. Clique no botão **"+"** para adicionar
4. Repita para cada adicional

#### **Exemplo - Pizzas:**
```
Borda Catupiry      | + R$ 5,00
Borda Cheddar       | + R$ 5,00
Borda Mussarela     | + R$ 6,00
Extra Bacon         | + R$ 4,00
Extra Queijo        | + R$ 3,00
```

---

## 💡 **EXEMPLOS DE USO:**

### **📦 EXEMPLO 1: PIZZAS**

**Configuração:**
- ✅ Tamanhos: Pequena (0.7x), Média (1.0x), Grande (1.3x)
- ✅ Sabores: Calabresa (R$ 35), Marguerita (R$ 32), Portuguesa (R$ 38) - Máximo 2
- ✅ Adicionais: Borda Catupiry (+ R$ 5), Extra Bacon (+ R$ 4)

**Como o cliente compra:**
1. Escolhe tamanho: **Média**
2. Escolhe sabores: **Calabresa + Marguerita** (média R$ 33,50)
3. Adiciona: **Borda Catupiry** (+ R$ 5,00)
4. **Total:** R$ 38,50

---

### **📦 EXEMPLO 2: HAMBÚRGUERES**

**Configuração:**
- ✅ Tamanhos: Simples (1.0x), Duplo (1.5x), Triplo (2.0x)
- ✅ Sabores: NÃO (hambúrguer já tem sabor fixo)
- ✅ Adicionais: Ovo (+ R$ 2), Bacon (+ R$ 4), Cebola Caramelizada (+ R$ 3)

**Como o cliente compra:**
1. Escolhe tamanho: **Duplo** (1.5x do preço base)
2. Adiciona: **Ovo + Bacon** (+ R$ 6,00)
3. **Total:** (Preço base × 1.5) + R$ 6,00

---

### **📦 EXEMPLO 3: BEBIDAS**

**Configuração:**
- ✅ Tamanhos: 350ml (0.5x), 600ml (0.8x), 1L (1.0x), 2L (1.5x)
- ❌ Sabores: NÃO
- ❌ Adicionais: NÃO

**Como o cliente compra:**
1. Escolhe tamanho: **2L** (1.5x do preço base)
2. **Total:** Preço base × 1.5

---

## ✏️ **EDITAR/REMOVER:**

### **Editar um item:**
- Clique no item na lista
- Altere o nome ou preço
- Clique fora para salvar

### **Remover um item:**
- Clique no **"X"** vermelho ao lado do item
- Confirme a remoção

### **Reordenar itens:**
- Arraste o ícone **"☰"** para cima ou para baixo

---

## ❓ **PERGUNTAS FREQUENTES:**

### **1. Posso usar personalização em todas as categorias?**
Sim! Você pode ativar para qualquer categoria (Pizzas, Hambúrgueres, Bebidas, Sobremesas, etc.)

### **2. Posso ter categorias SEM personalização?**
Sim! Apenas marque "Personalizável" nas categorias que precisam.

### **3. O que acontece se eu não configurar tamanhos?**
O cliente não verá a opção de escolher tamanho. O produto terá apenas o preço base.

### **4. Posso mudar depois de configurar?**
Sim! Você pode adicionar, editar ou remover opções a qualquer momento.

### **5. Como o cliente vê isso?**
Quando o cliente clicar em um produto da categoria personalizada, abrirá um modal com as opções que você configurou.

---

## 🎯 **DICAS:**

### **✅ BOAS PRÁTICAS:**

1. **Seja claro nos nomes:**
   - ✅ "Média (6 fatias)"
   - ❌ "M"

2. **Use preços realistas:**
   - Tamanho maior = multiplicador maior
   - Adicionais = valor justo

3. **Não exagere nas opções:**
   - Máximo 10-15 sabores
   - Máximo 5-8 adicionais

4. **Teste antes de publicar:**
   - Faça um pedido teste
   - Veja como fica para o cliente

### **❌ EVITE:**

1. **Muitas opções obrigatórias:**
   - Cliente pode desistir se for muito complexo

2. **Preços confusos:**
   - Seja transparente no cálculo

3. **Nomes técnicos:**
   - Use linguagem simples e clara

---

## 🆘 **PRECISA DE AJUDA?**

### **Suporte:**
- 📧 Email: suporte@virtualcardapio.com.br
- 💬 WhatsApp: (XX) XXXXX-XXXX
- 📚 Tutoriais: Acesse "Tutoriais" no menu

---

## 📊 **RESUMO RÁPIDO:**

```
1. Acesse: Dashboard → 🎨 Personalização
2. Selecione a categoria
3. Marque "Esta categoria é personalizável"
4. Salvar Configuração
5. Ative Tamanhos/Sabores/Adicionais conforme necessário
6. Adicione as opções
7. Pronto! Seus clientes já podem personalizar
```

---

**Data de criação:** 05/11/2024  
**Versão:** 1.0  
**Sistema:** Menu Digital - Personalização de Produtos
