# 📸 INSTRUÇÕES PARA ADICIONAR SCREENSHOTS

## 📁 **ESTRUTURA DE PASTAS:**

```
public/
  screenshots/
    admin-dashboard.png       ← Screenshot 1 (Dashboard com ações rápidas)
    admin-relatorios.png      ← Screenshot 11 (Relatórios de lucro)
    admin-produtos.png        ← Screenshot 3 (Lista de produtos)
    admin-mesas.png           ← Screenshot 4 (Gestão de mesas)
    admin-upsell.png          ← Screenshot 5 (Upsell com produtos)
    admin-comandas.png        ← Screenshot 7 (Painel de comandas tempo real)
    cliente-pagamento.png     ← Screenshot 9 (Formas de pagamento)
    cliente-pedido.png        ← Screenshot 10 (Acompanhamento pedido)
```

---

## 🎯 **MAPEAMENTO DOS SCREENSHOTS:**

### **ADMIN (Para o Dono):**

1. **admin-dashboard.png** = Screenshot 1
   - Dashboard com "Ações Rápidas"
   - Mostra: Adicionar Item, Nova Categoria, Cupons, etc.

2. **admin-relatorios.png** = Screenshot 11
   - Relatórios de Vendas e Lucro
   - Mostra: Faturamento, Custo Total, Lucro Líquido, ROI

3. **admin-produtos.png** = Screenshot 3
   - Lista de produtos (pizza, sanduíche, pudim)
   - Mostra: Imagens dos produtos, preços, botões de ação

4. **admin-mesas.png** = Screenshot 4
   - Gestão de Mesas
   - Mostra: Mesa 25, QR Code, botão "Baixar Todos QR Codes"

5. **admin-upsell.png** = Screenshot 5
   - Produtos para Upsell
   - Mostra: Coca cola, pizza, pudim, sanduíche com descontos

6. **admin-comandas.png** = Screenshot 7
   - Painel de Comandas em Tempo Real
   - Mostra: Pedidos aguardando, preparando, pronto

---

### **CLIENTE (Para quem vai comprar):**

7. **cliente-pagamento.png** = Screenshot 9
   - Formas de Pagamento
   - Mostra: PIX, Cartão na Entrega, Dinheiro na Entrega

8. **cliente-pedido.png** = Screenshot 10
   - Acompanhamento de Pedido ao Vivo
   - Mostra: Pedido #00020, Progresso 10%, Tempo Estimado, Itens

---

## 🚀 **COMO ADICIONAR AS IMAGENS:**

### **OPÇÃO 1: Manual (Recomendado)**

1. Crie a pasta `public/screenshots` se não existir
2. Salve cada screenshot com o nome correto
3. Certifique-se que são PNG ou JPG
4. Tamanho recomendado: 1080x2340px (proporção de celular)

### **OPÇÃO 2: Via PowerShell**

```powershell
# Criar pasta
New-Item -ItemType Directory -Force -Path "public\screenshots"

# Copiar screenshots (ajuste os caminhos)
Copy-Item "caminho\screenshot1.png" "public\screenshots\admin-dashboard.png"
Copy-Item "caminho\screenshot11.png" "public\screenshots\admin-relatorios.png"
Copy-Item "caminho\screenshot3.png" "public\screenshots\admin-produtos.png"
Copy-Item "caminho\screenshot4.png" "public\screenshots\admin-mesas.png"
Copy-Item "caminho\screenshot5.png" "public\screenshots\admin-upsell.png"
Copy-Item "caminho\screenshot7.png" "public\screenshots\admin-comandas.png"
Copy-Item "caminho\screenshot9.png" "public\screenshots\cliente-pagamento.png"
Copy-Item "caminho\screenshot10.png" "public\screenshots\cliente-pedido.png"
```

---

## ✂️ **REMOVER HORÁRIO DO TOPO:**

As imagens já estão configuradas no componente para cortar a parte superior (horário/status bar).

O componente `PhoneMockup` usa:
```tsx
className="object-cover object-top"
```

Isso garante que a imagem seja cortada do topo automaticamente!

---

## ✅ **CHECKLIST:**

- [ ] Criar pasta `public/screenshots`
- [ ] Salvar 8 screenshots com nomes corretos
- [ ] Verificar que imagens estão em formato PNG/JPG
- [ ] Testar localmente: `npm run dev`
- [ ] Fazer commit e push
- [ ] Deploy no Vercel

---

## 🎨 **RESULTADO FINAL:**

A landing page terá:

1. ✅ Seção "Veja Como Funciona"
2. ✅ Tabs: "Para Você (Dono)" e "Para Seus Clientes"
3. ✅ Mockups de iPhone com screenshots reais
4. ✅ Animações suaves ao trocar de tab
5. ✅ Hover effects nos mockups
6. ✅ Descrições em cada tela
7. ✅ CTA "Começar Agora - 15 Dias Grátis"

---

## 📝 **PRÓXIMOS PASSOS:**

1. Salvar os 8 screenshots na pasta `public/screenshots`
2. Testar localmente
3. Fazer deploy
4. Pronto! 🎉

---

**Os componentes já estão criados e prontos! Só falta adicionar as imagens!** ✨
