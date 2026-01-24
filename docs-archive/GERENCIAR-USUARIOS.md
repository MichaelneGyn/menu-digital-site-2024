# 👥 GERENCIAR USUÁRIOS - GUIA COMPLETO

## ✅ O QUE FOI CRIADO:

### **1. Página de Gerenciamento de Usuários**
- 📍 **URL:** http://localhost:3000/admin/usuarios
- 🔒 **Acesso:** Apenas `michaeldouglasqueiroz@gmail.com`

### **2. Funcionalidades:**
- ✅ **Listar todos os usuários** (com paginação)
- ✅ **Buscar por email, nome ou restaurante**
- ✅ **Filtrar por status** (Trial, Ativo, Cancelado)
- ✅ **Deletar usuários** (com confirmação)
- ✅ **Exportar para CSV**
- ✅ **Ver detalhes** (restaurante, plano, dias restantes)

---

## 🎯 COMO ACESSAR:

### **Opção 1: Pelo Dashboard**

1. Acesse: http://localhost:3000/admin/dashboard
2. Faça login com: `michaeldouglasqueiroz@gmail.com`
3. Procure o card **"👥 Usuários"** (badge vermelho "ADMIN")
4. Clique nele

### **Opção 2: URL Direta**

1. Acesse: http://localhost:3000/admin/usuarios
2. Se não estiver logado, será redirecionado para login

---

## 📊 O QUE VOCÊ VÊ NA TELA:

### **Informações de cada usuário:**

```
┌─────────────────────────────────────────────────┐
│ 👤 João Silva                                   │
│ 📧 joao@email.com                               │
│ 📱 11999999999                                  │
│                                                 │
│ 🏪 Pizzaria Bella Napoli (/bella-napoli)       │
│                                                 │
│ 🟢 Trial - 25 dias restantes                   │
│ 💳 Plano: Starter                               │
│                                                 │
│ 📅 Cadastro: 12/11/2024                         │
│                                                 │
│ [🗑️ Deletar]                                    │
└─────────────────────────────────────────────────┘
```

---

## 🔍 FILTROS DISPONÍVEIS:

### **1. Busca por Texto:**
- Email: `joao@email.com`
- Nome: `João Silva`
- Restaurante: `Pizzaria Bella`

### **2. Filtro por Status:**
- **Todos:** Mostra todos os usuários
- **Trial:** Apenas em período de teste
- **Ativos:** Apenas com assinatura ativa
- **Cancelados:** Apenas cancelados/inativos

---

## 🗑️ COMO DELETAR UM USUÁRIO:

### **Passo 1: Encontrar o Usuário**
1. Use a busca ou filtros
2. Localize o usuário desejado

### **Passo 2: Clicar em Deletar**
1. Clique no botão **🗑️** vermelho
2. Aparecerá um alerta de confirmação:

```
⚠️ ATENÇÃO!

Tem certeza que deseja DELETAR o usuário:
joao@email.com

Isso vai deletar:
- Conta do usuário
- Restaurante
- Todos os pedidos
- Todos os dados

Esta ação NÃO pode ser desfeita!
```

### **Passo 3: Confirmar**
1. Clique em **"OK"** para deletar
2. Ou **"Cancelar"** para voltar

### **Passo 4: Verificar**
1. Aparecerá: ✅ "Usuário deletado com sucesso!"
2. A lista será atualizada automaticamente

---

## 📥 EXPORTAR USUÁRIOS PARA CSV:

### **Como Exportar:**

1. Clique no botão **"📥 Exportar CSV"** no topo
2. Arquivo será baixado: `usuarios-2024-11-12.csv`

### **Dados Exportados:**

```csv
Email,Nome,WhatsApp,Restaurante,Status,Plano,Cadastro,Trial Termina
joao@email.com,João Silva,11999999999,Pizzaria Bella,Trial,Starter,12/11/2024,12/12/2024
maria@email.com,Maria Santos,11888888888,Burger House,Ativo,Pro,10/11/2024,N/A
```

### **Usar no Excel:**

1. Abra o Excel
2. Vá em **Dados > De Texto/CSV**
3. Selecione o arquivo baixado
4. Clique em **"Carregar"**

---

## 🔄 ATUALIZAR LISTA:

Clique no botão **"🔄 Atualizar"** para recarregar a lista de usuários.

---

## 🎨 BADGES DE STATUS:

- 🔵 **Trial** - Usuário em período de teste
- 🟢 **Ativo** - Assinatura ativa e pagando
- 🔴 **Cancelado** - Assinatura cancelada
- ⚫ **Inativo** - Sem assinatura

---

## 📊 ESTATÍSTICAS:

No topo da página você vê:
```
Total: 15 usuários
```

Isso muda conforme você aplica filtros.

---

## 🔒 SEGURANÇA:

### **Quem pode acessar?**
- ✅ Apenas: `michaeldouglasqueiroz@gmail.com`
- ❌ Outros usuários: Redirecionados para dashboard

### **O que acontece ao deletar?**
- ✅ Usuário é deletado do banco
- ✅ Restaurante é deletado (cascata)
- ✅ Pedidos são deletados (cascata)
- ✅ Todos os dados relacionados são deletados
- ❌ **NÃO** pode ser desfeito!

---

## 🧪 TESTAR AGORA:

### **1. Deletar os emails de teste:**

1. Acesse: http://localhost:3000/admin/usuarios
2. Busque por: `vituralcardapio@gmail.com`
3. Clique em **🗑️ Deletar**
4. Confirme
5. Repita para: `wowzinhodouglas@gmail.com`

### **2. Verificar se foram deletados:**

1. Busque novamente pelos emails
2. Não deve aparecer nada
3. Total de usuários deve diminuir

---

## 🆘 TROUBLESHOOTING:

### **Problema 1: Página não carrega**
**Solução:**
```bash
# Reiniciar o servidor
npm run dev
```

### **Problema 2: "Acesso negado"**
**Solução:**
- Verifique se está logado com: `michaeldouglasqueiroz@gmail.com`
- Faça logout e login novamente

### **Problema 3: Erro ao deletar**
**Solução:**
- Verifique os logs do terminal
- Pode ser erro de permissão no banco
- Execute no Supabase:
```sql
-- Verificar se o usuário existe
SELECT * FROM "User" WHERE email = 'email@teste.com';

-- Deletar manualmente
DELETE FROM "User" WHERE email = 'email@teste.com';
```

### **Problema 4: Lista vazia**
**Solução:**
- Clique em **"🔄 Atualizar"**
- Verifique se há usuários no banco:
```sql
SELECT COUNT(*) FROM "User";
```

---

## 📱 RESPONSIVO:

A página funciona perfeitamente em:
- ✅ Desktop (melhor experiência)
- ✅ Tablet
- ✅ Mobile (scroll horizontal na tabela)

---

## 🎯 PRÓXIMAS MELHORIAS (Opcional):

- [ ] Editar dados do usuário
- [ ] Resetar senha do usuário
- [ ] Banir usuário (sem deletar)
- [ ] Ver histórico de pedidos
- [ ] Enviar email para o usuário
- [ ] Alterar plano manualmente
- [ ] Ver logs de atividade

---

## 📞 SUPORTE:

Se tiver problemas, me envie:
1. Print da tela de usuários
2. Print do erro (se houver)
3. Logs do terminal
4. Email do usuário que está tentando deletar

---

## ✅ RESUMO RÁPIDO:

```
1. Acesse: http://localhost:3000/admin/usuarios
2. Login: michaeldouglasqueiroz@gmail.com
3. Busque o usuário
4. Clique em 🗑️ Deletar
5. Confirme
6. Pronto! ✅
```

---

**🎉 AGORA VOCÊ TEM CONTROLE TOTAL DOS USUÁRIOS!** 👥
