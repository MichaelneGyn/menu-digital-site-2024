# 📱 Como Testar o Site no Seu Celular

## 1️⃣ Descubra seu IP local

```bash
# Windows:
ipconfig

# Procure por "IPv4 Address"
# Exemplo: 192.168.1.10
```

## 2️⃣ Inicie o servidor local

```bash
npm run dev
# Servidor rodando em http://localhost:3001
```

## 3️⃣ Conecte seu celular no mesmo WiFi

- Celular e PC precisam estar na MESMA rede WiFi

## 4️⃣ Acesse no celular

```
No navegador do celular, digite:
http://[SEU_IP]:3001

Exemplo:
http://192.168.1.10:3001
```

## 5️⃣ Teste TUDO

✅ Navegação
✅ Adicionar produtos ao carrinho
✅ Carrinho flutuante aparece?
✅ Checkout funciona?
✅ WhatsApp abre?
✅ Performance boa?

## 🔥 Dica Extra: Inspect no Mobile

### Chrome Android:
1. Conecte celular no PC via USB
2. Ative "Depuração USB" no Android
3. Chrome PC > Mais ferramentas > Remote devices
4. Veja console e erros do celular!

### Safari iOS:
1. Mac + iPhone via cabo
2. Safari > Develop > [Seu iPhone]
3. Inspect direto no iPhone!

## 🌐 Alternativa: Deploy Rápido

Se não conseguir testar local, faça deploy em:
- Vercel (grátis, 2 minutos)
- Netlify (grátis)
- Railway (grátis)

Depois teste no celular com a URL real!

## ⚠️ IMPORTANTE

DevTools Chrome NÃO substitui teste real!
Sempre valide no dispositivo real antes de lançar!
