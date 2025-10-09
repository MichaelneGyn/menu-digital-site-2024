# 💳 Guia de Configuração - Formas de Pagamento

## 📋 **Formas de Pagamento Disponíveis**

### **1. 💵 Dinheiro na Entrega**
- ✅ **Já funciona** - Não precisa configurar nada
- Cliente informa se precisa de troco
- Pagamento na hora da entrega

### **2. 💳 Cartão na Entrega (Crédito/Débito)**
- ✅ **Já funciona** - Não precisa configurar nada
- Cliente escolhe entre Crédito ou Débito
- Você leva a **maquininha** na entrega
- Pagamento processado na hora

### **3. 📱 PIX**
- ⚠️ **Precisa configurar** sua chave PIX ou QR Code
- Cliente paga antes da entrega
- Envia comprovante via WhatsApp

---

## 🔧 **Como Configurar PIX**

### **Opção 1: Adicionar Chave PIX (Recomendado)**

1. **Acesse o Dashboard Admin**
   ```
   https://seusite.com/admin/dashboard
   ```

2. **Vá em "Configurações do Restaurante"**

3. **Encontre o campo "Chave PIX"**

4. **Cole sua chave PIX** (pode ser):
   - CPF/CNPJ
   - E-mail
   - Telefone
   - Chave aleatória

**Exemplo:**
```
Chave PIX: contato@seunegocio.com.br
```

---

### **Opção 2: Adicionar QR Code PIX Estático**

#### **Passo 1: Gerar QR Code no seu banco**

1. Acesse o app do seu banco
2. Vá em **PIX → Receber → QR Code Estático**
3. Escolha **sem valor fixo** (para aceitar qualquer quantia)
4. Salve a **imagem do QR Code**

#### **Passo 2: Fazer upload da imagem**

**Opção A: Usar hospedagem de imagens**
```
1. Acesse: https://imgur.com ou https://imgbb.com
2. Faça upload da imagem do QR Code
3. Copie o link direto da imagem
4. Cole no campo "URL do QR Code PIX" no dashboard
```

**Opção B: Salvar na pasta public do projeto**
```
1. Salve a imagem em: /public/qrcode-pix.png
2. No campo "URL do QR Code PIX" digite: /qrcode-pix.png
```

---

## 📊 **Como o Cliente Vê**

### **Quando seleciona PIX:**

#### **Com Chave PIX configurada:**
```
┌─────────────────────────────────┐
│ 💚 Pagamento via PIX            │
├─────────────────────────────────┤
│ Chave PIX:                      │
│ ┌─────────────────────────────┐ │
│ │ contato@seunegocio.com.br   │ │
│ └─────────────────────────────┘ │
│                                 │
│ Após realizar o pagamento,      │
│ envie o comprovante via         │
│ WhatsApp.                       │
└─────────────────────────────────┘
```

#### **Com QR Code configurado:**
```
┌─────────────────────────────────┐
│ 💚 Pagamento via PIX            │
├─────────────────────────────────┤
│ QR Code PIX:                    │
│ ┌───────────────┐               │
│ │  ▀▀▀▀▀▀▀▀▀▀▀ │               │
│ │  █ █▀▀▀▀█ █  │               │
│ │  █ █   █ █   │  (QR Code)    │
│ │  █ █▄▄▄█ █   │               │
│ │  ▄▄▄▄▄▄▄▄▄▄▄  │               │
│ └───────────────┘               │
│                                 │
│ Escaneie o QR Code para pagar   │
└─────────────────────────────────┘
```

#### **Sem configuração:**
```
┌─────────────────────────────────┐
│ 💚 Pagamento via PIX            │
├─────────────────────────────────┤
│ Entre em contato via WhatsApp   │
│ para receber os dados PIX e     │
│ finalizar o pagamento.          │
└─────────────────────────────────┘
```

---

## 🎯 **Fluxo do Pedido com PIX**

```
1. Cliente escolhe produtos
   ↓
2. Seleciona "PIX" como pagamento
   ↓
3. Vê sua Chave PIX ou QR Code
   ↓
4. Realiza o pagamento no app do banco
   ↓
5. Clica em "Finalizar Pedido"
   ↓
6. É redirecionado para WhatsApp
   ↓
7. Envia pedido + comprovante de pagamento
   ↓
8. Você confirma o pagamento
   ↓
9. Prepara e entrega o pedido
```

---

## 🎯 **Fluxo com Cartão na Entrega**

```
1. Cliente escolhe produtos
   ↓
2. Seleciona "Cartão na Entrega"
   ↓
3. Escolhe: Crédito ou Débito
   ↓
4. Clica em "Finalizar Pedido"
   ↓
5. É redirecionado para WhatsApp
   ↓
6. Você prepara o pedido
   ↓
7. Leva a maquininha na entrega
   ↓
8. Cliente paga no local
```

---

## 🎯 **Fluxo com Dinheiro**

```
1. Cliente escolhe produtos
   ↓
2. Seleciona "Dinheiro na Entrega"
   ↓
3. Marca se precisa de troco
   ↓
4. Informa valor (ex: R$ 50,00)
   ↓
5. Sistema calcula troco
   ↓
6. Clica em "Finalizar Pedido"
   ↓
7. É redirecionado para WhatsApp
   ↓
8. Você separa o troco
   ↓
9. Entrega e recebe pagamento
```

---

## ⚙️ **Configuração Técnica via Banco de Dados**

Se preferir configurar diretamente no banco:

```sql
-- Atualizar chave PIX
UPDATE "Restaurant" 
SET "pixKey" = 'sua-chave-pix@exemplo.com'
WHERE "id" = 'seu-restaurant-id';

-- Atualizar QR Code PIX
UPDATE "Restaurant" 
SET "pixQrCode" = 'https://i.imgur.com/abc123.png'
WHERE "id" = 'seu-restaurant-id';

-- Ou ambos
UPDATE "Restaurant" 
SET 
  "pixKey" = 'sua-chave-pix@exemplo.com',
  "pixQrCode" = 'https://i.imgur.com/abc123.png'
WHERE "id" = 'seu-restaurant-id';
```

---

## 📱 **Exemplos de Chaves PIX Válidas**

```
✅ CPF: 123.456.789-00
✅ CNPJ: 12.345.678/0001-90
✅ E-mail: pagamento@restaurante.com.br
✅ Telefone: +55 62 99999-9999
✅ Chave aleatória: abc12345-6789-0def-1234-56789abcdef0
```

---

## ❓ **Perguntas Frequentes**

### **P: Preciso ter uma chave PIX cadastrada?**
R: Não é obrigatório! Mas facilita muito para o cliente. Se não configurar, ele receberá a mensagem para pedir os dados por WhatsApp.

### **P: Posso usar QR Code e Chave PIX juntos?**
R: Sim! Se configurar ambos, o cliente verá os dois e pode escolher qual usar.

### **P: O QR Code precisa ter valor fixo?**
R: **NÃO!** Use QR Code **estático sem valor**. O cliente digitará o valor correto do pedido.

### **P: Como sei que o cliente pagou o PIX?**
R: O cliente deve enviar o comprovante via WhatsApp antes de você preparar o pedido.

### **P: Preciso de maquininha para "Cartão na Entrega"?**
R: Sim! Você leva a maquininha e processa o pagamento no local.

### **P: E se não tiver maquininha?**
R: Desabilite a opção "Cartão na Entrega" no sistema (futura atualização) ou informe ao cliente via WhatsApp que aceita apenas PIX ou Dinheiro.

---

## 🔒 **Segurança**

### **Recomendações:**
- ✅ Sempre peça comprovante de PIX antes de preparar
- ✅ Confirme o valor no comprovante
- ✅ Para cartão, só aceite com senha (nunca assinatura)
- ✅ Para dinheiro, confira notas antes de dar o troco

---

## 🆘 **Suporte**

**Precisa de ajuda para configurar?**

1. Abra o dashboard admin
2. Vá em "Configurações"
3. Procure os campos:
   - **Chave PIX**
   - **URL do QR Code PIX**
4. Preencha e salve

**Ainda com dúvida?**
- Entre em contato com o suporte técnico
- Forneça o ID do seu restaurante

---

**✅ Configuração completa! Seus clientes já podem escolher a melhor forma de pagamento!** 🎉
