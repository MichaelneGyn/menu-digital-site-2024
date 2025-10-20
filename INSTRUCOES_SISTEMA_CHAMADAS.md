# 🔔 SISTEMA DE CHAMADAS DE GARÇOM - INSTRUÇÕES

## ✅ **O QUE FOI IMPLEMENTADO:**

```
1. ✅ Tabela WaiterCall no banco
2. ✅ API para criar chamadas
3. ✅ API para listar chamadas ativas
4. ✅ API para marcar como atendida
5. ✅ Dashboard com painel visual
6. ✅ Som de alerta (beep automático)
7. ✅ Atualização automática a cada 5 segundos
8. ✅ Botão ligar/desligar som
9. ✅ Histórico de chamadas recentes
10. ✅ Indicador de urgência (cor muda com tempo)
```

---

## 📋 **PASSO 1 - EXECUTAR SQL NO SUPABASE:**

### **1. Acesse o Supabase:**
```
https://supabase.com/dashboard
→ Selecione seu projeto
→ Menu lateral: SQL Editor
→ Clique: "+ New query"
```

### **2. Cole e Execute o SQL:**

**Arquivo:** `CREATE_WAITER_CALL_TABLE.sql` (está na raiz do projeto)

```sql
-- Copie TODO o conteúdo do arquivo CREATE_WAITER_CALL_TABLE.sql
-- Cole no SQL Editor
-- Clique: "Run" (ou Ctrl+Enter)
```

### **3. Verifique:**
```sql
-- Execute este comando para confirmar:
SELECT COUNT(*) FROM "WaiterCall";
-- Deve retornar: 0 (zero chamadas por enquanto)
```

---

## 🚀 **PASSO 2 - FAZER REDEPLOY NA VERCEL:**

### **Opção A - Automático (Recomendado):**
```
O push que acabei de fazer vai triggerar deploy automático
Aguarde ~3 minutos
```

### **Opção B - Manual:**
```
1. https://vercel.com/dashboard
2. Projeto: menu-digital-site-2024
3. Aba: Deployments
4. Último deploy → ⋮ → "Redeploy"
5. Aguarde ~3 minutos
```

---

## 🧪 **PASSO 3 - TESTAR O SISTEMA:**

### **3.1 - Acessar Dashboard de Chamadas:**
```
URL: seu-site.vercel.app/admin/waiter-calls

Deve mostrar:
- "Nenhuma chamada ativa"
- Botão "Som ON/OFF"
- Painel vazio (por enquanto)
```

### **3.2 - Fazer uma Chamada (Teste):**
```
1. Vá em: /admin/tables
2. Selecione uma mesa
3. Clique no QR Code (ou copie URL)
4. Abra em outra aba/celular
5. Clique: "Chamar Garçom"
6. ✅ Deve aparecer: "Garçom chamado!"
```

### **3.3 - Ver no Dashboard:**
```
1. Volte para: /admin/waiter-calls
2. Aguarde até 5 segundos (atualização automática)
3. ✅ Deve aparecer a mesa na lista
4. 🔊 Deve tocar um "BEEP" se som estiver ON
5. Cor do card:
   - Amarelo: < 2 min
   - Laranja: 2-5 min
   - Vermelho pulsante: > 5 min
```

### **3.4 - Atender Chamada:**
```
1. Clique: "Atender"
2. ✅ Mesa sai da lista ativa
3. ✅ Vai para "Histórico Recente"
```

---

## 🎨 **COMO FUNCIONA:**

### **Fluxo Completo:**

```
Cliente (Mesa 4):
  ↓
Clica "Chamar Garçom"
  ↓
Sistema salva no banco:
  - restaurantId
  - tableId
  - tableNumber
  - status: PENDING
  - createdAt: agora
  ↓
Dashboard (Garçom):
  ↓
Atualiza a cada 5 segundos
  ↓
Mostra:
  - Mesa 4
  - Esperando há: 2min
  - Botões: [Atender] [Dispensar]
  ↓
🔊 "BEEP!" (se nova chamada)
  ↓
Garçom clica "Atender"
  ↓
Sistema atualiza:
  - status: ATTENDED
  - attendedAt: agora
  ↓
Mesa sai da lista ativa
  ↓
Vai para histórico ✅
```

---

## ⚙️ **CONFIGURAÇÕES:**

### **Habilitar/Desabilitar Feature:**

```sql
-- No futuro, você pode desabilitar por restaurante:
UPDATE "Restaurant" 
SET "enableWaiterCall" = false 
WHERE id = 'restaurant_id_aqui';

-- Isso fará o botão não aparecer no QR Code
```

---

## 🎯 **FUNCIONALIDADES:**

### **✅ O que está implementado:**
```
✅ Dashboard organizado
✅ Som de alerta (beep)
✅ Atualização automática (5 seg)
✅ Indicador de urgência (cores)
✅ Tempo de espera visível
✅ Botão ON/OFF para som
✅ Histórico de 2 horas
✅ Marca como atendida
✅ Marca como dispensada
✅ Não cria chamada duplicada
```

### **📱 O que NÃO está implementado (opcional):**
```
❌ WhatsApp automático (pode adicionar depois)
❌ Push notification (não necessário)
❌ SMS (custo alto)
❌ App mobile (web é suficiente)
```

---

## 💡 **DICAS DE USO:**

### **Para o Restaurante:**
```
1. Deixe tablet/celular com dashboard aberto
2. Mantenha som ligado
3. Verifique a cada minuto (ou deixe atualizar sozinho)
4. Priorize chamadas antigas (vermelho)
5. Marque como atendida após ir na mesa
```

### **Para Você (Admin):**
```
1. Pode ver estatísticas depois:
   - Quantas chamadas/dia
   - Tempo médio de espera
   - Mesas que mais chamam
   - Horários de pico
```

---

## 🐛 **TROUBLESHOOTING:**

### **Problema: Não aparece no dashboard**
```
Solução:
1. Execute SQL no Supabase (Passo 1)
2. Faça redeploy na Vercel
3. Aguarde 3 minutos
4. Force refresh: Ctrl+Shift+R
```

### **Problema: Não toca som**
```
Solução:
1. Verifique se botão está "Som ON"
2. Teste volume do dispositivo
3. Alguns navegadores bloqueiam som automático
4. Clique na página antes (ativa áudio)
```

### **Problema: Não atualiza automaticamente**
```
Solução:
1. Verifique internet
2. Abra Console (F12) → Network
3. Deve fazer requisição a cada 5 segundos
4. Se não, force refresh
```

---

## 📊 **PRÓXIMOS PASSOS (OPCIONAL):**

### **Melhorias Futuras:**
```
1. Gráficos de estatísticas
2. Relatório de chamadas
3. Exportar para Excel
4. WhatsApp backup (se muitas chamadas)
5. App mobile nativo
6. Integração com impressora (imprimir ticket)
```

---

## ✅ **CHECKLIST FINAL:**

```
☐ Executou SQL no Supabase?
☐ Viu mensagem "Success"?
☐ Aguardou deploy (3 min)?
☐ Testou acessar /admin/waiter-calls?
☐ Dashboard carrega sem erro?
☐ Criou mesa de teste?
☐ Clicou "Chamar Garçom"?
☐ Apareceu no dashboard?
☐ Som tocou?
☐ Conseguiu marcar como atendida?
☐ Foi para histórico?
```

---

## 🎉 **PRONTO!**

Sistema completo de chamadas implementado!

**Qualquer dúvida, me avisa!** 🚀
