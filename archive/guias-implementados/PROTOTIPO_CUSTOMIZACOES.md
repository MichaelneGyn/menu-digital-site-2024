# 🎨 PROTÓTIPO - Sistema de Customizações Dinâmicas

## 📋 VISÃO GERAL

Sistema que permite cada restaurante configurar suas próprias opções de customização de produtos (sabores, bordas, extras, ingredientes, etc.) de forma independente.

---

## 🖥️ TELA 1: DASHBOARD - LISTA DE GRUPOS DE CUSTOMIZAÇÃO

```
┌─────────────────────────────────────────────────────────────────┐
│  Dashboard > Customizações                            [+ Novo Grupo] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🔍 Buscar grupos...                                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 🍕 Sabores de Pizza                          ✏️  🗑️  ⚡  │ │
│  │ Obrigatório • Máximo 2 seleções • 12 opções              │ │
│  │ ─────────────────────────────────────────────────────   │ │
│  │ ✅ Calabresa com Catupiry      R$ 0,00                   │ │
│  │ ✅ Portuguesa                  R$ 0,00                   │ │
│  │ ✅ Frango com Catupiry         R$ 0,00                   │ │
│  │ ✅ Bacon                        R$ 0,00                   │ │
│  │ ✅ 4 Queijos                    R$ 0,00                   │ │
│  │ ... e mais 7 opções                      [Ver todas ▼]   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 🧀 Bordas Irresistíveis                  ✏️  🗑️  ⚡      │ │
│  │ Opcional • Máximo 1 seleção • 8 opções                   │ │
│  │ ─────────────────────────────────────────────────────   │ │
│  │ ✅ Borda de Catupiry           + R$ 15,90                │ │
│  │ ✅ Borda de Cheddar            + R$ 15,90                │ │
│  │ ✅ Borda de Mussarela          + R$ 17,90                │ │
│  │ ✅ Borda de Cream Cheese       + R$ 17,90                │ │
│  │ ❌ Borda de Chocolate (inativa) + R$ 12,00               │ │
│  │ ... e mais 3 opções                      [Ver todas ▼]   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ ➕ Extras Adicionais                     ✏️  🗑️  ⚡      │ │
│  │ Opcional • Sem limite • 6 opções                         │ │
│  │ ─────────────────────────────────────────────────────   │ │
│  │ ✅ Extra Queijo                + R$ 8,00                 │ │
│  │ ✅ Extra Bacon                 + R$ 10,00                │ │
│  │ ✅ Extra Catupiry              + R$ 6,00                 │ │
│  │ ✅ Extra Calabresa             + R$ 8,00                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 🍔 Pontos da Carne (X-Burger)            ✏️  🗑️  ⚡      │ │
│  │ Obrigatório • Máximo 1 seleção • 3 opções                │ │
│  │ ─────────────────────────────────────────────────────   │ │
│  │ ✅ Mal Passado                 R$ 0,00                   │ │
│  │ ✅ Ao Ponto                    R$ 0,00                   │ │
│  │ ✅ Bem Passado                 R$ 0,00                   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Legenda:
✏️ = Editar grupo
🗑️ = Excluir grupo
⚡ = Ativar/Desativar
✅ = Opção ativa
❌ = Opção inativa
```

---

## 🖥️ TELA 2: CRIAR/EDITAR GRUPO DE CUSTOMIZAÇÃO

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Voltar    Novo Grupo de Customização                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Informações Básicas                                            │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Nome do Grupo *                                          │  │
│  │ ┌─────────────────────────────────────────────────────┐ │  │
│  │ │ Sabores de Pizza                                     │ │  │
│  │ └─────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  │ Descrição (opcional)                                     │  │
│  │ ┌─────────────────────────────────────────────────────┐ │  │
│  │ │ Escolha até 2 sabores para sua pizza                │ │  │
│  │ └─────────────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Configurações de Seleção                                       │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ ☑️ Seleção obrigatória                                   │  │
│  │                                                          │  │
│  │ Mínimo de seleções:  [1 ▼]                              │  │
│  │ Máximo de seleções:  [2 ▼]  ☑️ Ilimitado               │  │
│  │                                                          │  │
│  │ ℹ️ O cliente deverá escolher de 1 a 2 opções           │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Opções do Grupo                           [+ Adicionar Opção]  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  🍕 Calabresa com Catupiry                               │  │
│  │     Preço: R$ 0,00        Status: ● Ativa      🗑️       │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  🍕 Portuguesa                                           │  │
│  │     Preço: R$ 0,00        Status: ● Ativa      🗑️       │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  🍕 Frango com Catupiry                                  │  │
│  │     Preço: R$ 0,00        Status: ● Ativa      🗑️       │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  🍕 4 Queijos                                            │  │
│  │     Preço: R$ 0,00        Status: ○ Inativa    🗑️       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌────────────────────────────┐                                │
│  │ [Cancelar]    [Salvar Grupo] │                              │
│  └────────────────────────────┘                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🖥️ TELA 3: ADICIONAR OPÇÃO AO GRUPO

```
┌──────────────────────────────────────────────┐
│  Nova Opção - Sabores de Pizza           × │
├──────────────────────────────────────────────┤
│                                              │
│  Nome da Opção *                             │
│  ┌──────────────────────────────────────┐   │
│  │ Margherita                            │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  Preço Adicional                             │
│  ┌──────────────────────────────────────┐   │
│  │ R$ 0,00                               │   │
│  └──────────────────────────────────────┘   │
│  ℹ️ Deixe 0,00 se não houver custo extra    │
│                                              │
│  Imagem (opcional)                           │
│  ┌──────────────────────────────────────┐   │
│  │ [📁 Selecionar arquivo]               │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ☑️ Opção ativa                              │
│                                              │
│  ┌────────────────────────┐                 │
│  │ [Cancelar]  [Adicionar] │                 │
│  └────────────────────────┘                 │
└──────────────────────────────────────────────┘
```

---

## 🖥️ TELA 4: VINCULAR CUSTOMIZAÇÕES A PRODUTOS

```
┌─────────────────────────────────────────────────────────────────┐
│  Dashboard > Produtos > Pizza Grande > Customizações             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📦 Pizza Grande - R$ 45,00                                     │
│  🖼️ [Imagem da pizza]                                           │
│                                                                 │
│  Grupos de Customização Vinculados                              │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ ☑️ Sabores de Pizza (Obrigatório - Máx: 2)              │  │
│  │ ☑️ Bordas Irresistíveis (Opcional - Máx: 1)             │  │
│  │ ☑️ Extras Adicionais (Opcional - Ilimitado)             │  │
│  │ ☐ Pontos da Carne                                        │  │
│  │ ☐ Ingredientes do X-Burger                               │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  💡 Grupos marcados aparecerão no modal de customização         │
│                                                                 │
│  ┌────────────────────────┐                                    │
│  │ [Cancelar]    [Salvar]  │                                    │
│  └────────────────────────┘                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📱 FRONTEND DO CLIENTE - MODAL CUSTOMIZADO

### Exemplo 1: Pizza Grande

```
┌─────────────────────────────────────────────────────────────┐
│  Escolha o sabor de Pizza Grande                        × │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🍕 SABORES DE PIZZA                [OBRIGATÓRIO]           │
│  Escolha até 2 sabores                                      │
│  ┌─────────────────────┐  ┌─────────────────────┐         │
│  │ ○ Calabresa c/       │  │ ○ Portuguesa         │         │
│  │   Catupiry           │  │                      │         │
│  └─────────────────────┘  └─────────────────────┘         │
│  ┌─────────────────────┐  ┌─────────────────────┐         │
│  │ ● Frango c/          │  │ ● Bacon              │         │
│  │   Catupiry ✓         │  │       ✓              │         │
│  └─────────────────────┘  └─────────────────────┘         │
│  ┌─────────────────────┐  ┌─────────────────────┐         │
│  │ ⊗ 4 Queijos          │  │ ⊗ Margherita         │         │
│  │   (máx atingido)     │  │   (máx atingido)     │         │
│  └─────────────────────┘  └─────────────────────┘         │
│                                                             │
│  🧀 BORDAS IRRESISTÍVEIS               [OPCIONAL]           │
│  ┌─────────────────────┐  ┌─────────────────────┐         │
│  │ ○ Borda de           │  │ ● Borda de Cheddar   │         │
│  │   Catupiry           │  │   + R$ 15,90  ✓      │         │
│  │   + R$ 15,90         │  │                      │         │
│  └─────────────────────┘  └─────────────────────┘         │
│  ┌─────────────────────┐  ┌─────────────────────┐         │
│  │ ○ Borda de           │  │ ○ Borda de Cream     │         │
│  │   Mussarela          │  │   Cheese             │         │
│  │   + R$ 17,90         │  │   + R$ 17,90         │         │
│  └─────────────────────┘  └─────────────────────┘         │
│                                                             │
│  ➕ EXTRAS ADICIONAIS                  [OPCIONAL]           │
│  ┌─────────────────────┐  ┌─────────────────────┐         │
│  │ ● Extra Queijo       │  │ ○ Extra Bacon        │         │
│  │   + R$ 8,00   ✓      │  │   + R$ 10,00         │         │
│  └─────────────────────┘  └─────────────────────┘         │
│                                                             │
│  📝 OBSERVAÇÕES?                       [OPCIONAL]           │
│  ┌───────────────────────────────────────────────────┐    │
│  │ Sem cebola, por favor                              │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Cancelar]             [+ Adicionar - R$ 68,90]           │
└─────────────────────────────────────────────────────────────┘

Cálculo:
- Pizza Grande (base): R$ 45,00
- Borda de Cheddar:    + R$ 15,90
- Extra Queijo:        + R$ 8,00
─────────────────────────────────
TOTAL:                   R$ 68,90
```

### Exemplo 2: X-Burger

```
┌─────────────────────────────────────────────────────────────┐
│  Escolha suas opções de X-Burger                        × │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🥩 PONTO DA CARNE                     [OBRIGATÓRIO]        │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐   │
│  │ ● Mal Passado │ │ ○ Ao Ponto    │ │ ○ Bem Passado │   │
│  │     ✓         │ │               │ │               │   │
│  └───────────────┘ └───────────────┘ └───────────────┘   │
│                                                             │
│  🧀 INGREDIENTES EXTRAS                [OPCIONAL]           │
│  ┌─────────────────────┐  ┌─────────────────────┐         │
│  │ ● Extra Queijo       │  │ ● Extra Bacon        │         │
│  │   + R$ 5,00   ✓      │  │   + R$ 8,00   ✓      │         │
│  └─────────────────────┘  └─────────────────────┘         │
│  ┌─────────────────────┐  ┌─────────────────────┐         │
│  │ ○ Ovo                │  │ ○ Catupiry           │         │
│  │   + R$ 3,00          │  │   + R$ 6,00          │         │
│  └─────────────────────┘  └─────────────────────┘         │
│                                                             │
│  🥖 TIPO DE PÃO                        [OBRIGATÓRIO]        │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐   │
│  │ ● Brioche     │ │ ○ Australiano │ │ ○ Tradicional │   │
│  │  + R$ 2,00 ✓  │ │  + R$ 3,00    │ │   R$ 0,00     │   │
│  └───────────────┘ └───────────────┘ └───────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Cancelar]             [+ Adicionar - R$ 33,00]           │
└─────────────────────────────────────────────────────────────┘

Cálculo:
- X-Burger (base):     R$ 18,00
- Extra Queijo:        + R$ 5,00
- Extra Bacon:         + R$ 8,00
- Pão Brioche:         + R$ 2,00
─────────────────────────────────
TOTAL:                   R$ 33,00
```

---

## 🔄 FLUXO DE USO

### Para o DONO DO RESTAURANTE:

```
1. Dashboard > Customizações
   └─ Cria grupo "Sabores de Pizza"
      - Marca como obrigatório
      - Define máximo 2 seleções
      - Adiciona opções:
        • Calabresa (R$ 0,00)
        • Portuguesa (R$ 0,00)
        • Frango (R$ 0,00)
        • etc.

2. Dashboard > Customizações
   └─ Cria grupo "Bordas"
      - Marca como opcional
      - Define máximo 1 seleção
      - Adiciona opções:
        • Catupiry (+ R$ 15,90)
        • Cheddar (+ R$ 15,90)
        • etc.

3. Dashboard > Produtos > Pizza Grande
   └─ Vincula customizações:
      ☑️ Sabores de Pizza
      ☑️ Bordas
      ☑️ Extras

4. Resultado: Cliente vê modal com as opções configuradas! ✅
```

### Para o CLIENTE FINAL:

```
1. Site do restaurante
   └─ Clica em "Pizza Grande"

2. Modal abre com:
   - Sabores (obrigatório, máx 2)
   - Bordas (opcional, máx 1)
   - Extras (opcional, ilimitado)

3. Faz as escolhas:
   - Frango + Bacon
   - Borda de Cheddar (+ R$ 15,90)
   - Extra Queijo (+ R$ 8,00)

4. Vê o total: R$ 68,90

5. Clica em "Adicionar"

6. Produto vai para o carrinho com todas as customizações! ✅
```

---

## 📊 VANTAGENS DO SISTEMA

### ✅ Para Você (Desenvolvedor/Vendedor):

```
✅ Sistema único serve TODOS os tipos de restaurante
✅ Não precisa codificar para cada cliente
✅ Cada restaurante configura o que quiser
✅ Fácil de vender: "Configure você mesmo!"
✅ Escalável: funciona para 10 ou 10.000 restaurantes
```

### ✅ Para o DONO DO RESTAURANTE:

```
✅ Total controle sobre opções e preços
✅ Pode adicionar/remover quando quiser
✅ Pode ativar/desativar temporariamente
✅ Pode criar promoções alterando preços
✅ Não depende de programador
```

### ✅ Para o CLIENTE FINAL:

```
✅ Interface familiar (igual iFood)
✅ Vê todas as opções disponíveis
✅ Preço calculado em tempo real
✅ Pode adicionar observações
✅ Experiência personalizada por restaurante
```

---

## 💾 ESTRUTURA DE DADOS (EXEMPLO)

```json
{
  "restaurant": {
    "id": "rest_abc123",
    "name": "MD Burges",
    "customizationGroups": [
      {
        "id": "group_pizza_flavors",
        "name": "Sabores de Pizza",
        "description": "Escolha até 2 sabores",
        "isRequired": true,
        "minSelections": 1,
        "maxSelections": 2,
        "sortOrder": 1,
        "options": [
          {
            "id": "opt_calabresa",
            "name": "Calabresa com Catupiry",
            "price": 0,
            "image": "/uploads/calabresa.jpg",
            "isActive": true,
            "sortOrder": 1
          },
          {
            "id": "opt_portuguesa",
            "name": "Portuguesa",
            "price": 0,
            "image": "/uploads/portuguesa.jpg",
            "isActive": true,
            "sortOrder": 2
          }
        ]
      },
      {
        "id": "group_borders",
        "name": "Bordas Irresistíveis",
        "description": null,
        "isRequired": false,
        "minSelections": 0,
        "maxSelections": 1,
        "sortOrder": 2,
        "options": [
          {
            "id": "opt_catupiry_border",
            "name": "Borda de Catupiry",
            "price": 15.90,
            "image": null,
            "isActive": true,
            "sortOrder": 1
          },
          {
            "id": "opt_cheddar_border",
            "name": "Borda de Cheddar",
            "price": 15.90,
            "image": null,
            "isActive": true,
            "sortOrder": 2
          }
        ]
      }
    ]
  },
  "products": [
    {
      "id": "prod_pizza_grande",
      "name": "Pizza Grande",
      "price": 45.00,
      "customizationGroupIds": [
        "group_pizza_flavors",
        "group_borders",
        "group_extras"
      ]
    }
  ]
}
```

---

## 🎯 PRÓXIMOS PASSOS

Se aprovar este protótipo, vou:

1. ✅ Criar os modelos no banco de dados
2. ✅ Criar as APIs necessárias
3. ✅ Criar as telas do dashboard
4. ✅ Atualizar o modal do cliente
5. ✅ Migrar dados existentes
6. ✅ Documentar para você vender

---

## ❓ O QUE ACHA?

- Gostou do layout/fluxo? 👍
- Quer mudar algo? 🔄
- Posso começar a implementar? 🚀
