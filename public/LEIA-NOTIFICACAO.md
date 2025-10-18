# 🔔 Som de Notificação

## O sistema tenta tocar um som quando novo pedido chega.

### Arquivo necessário:
```
public/notification.mp3
```

### Como adicionar:

**Opção 1: Gravar seu próprio som**
1. No Windows, grave um "Ding!" curto
2. Salve como `notification.mp3`
3. Coloque em: `public/notification.mp3`

**Opção 2: Usar som do sistema**
Se não tiver arquivo MP3, o sistema tenta:
- Vibração (mobile)
- Beep do sistema

**Opção 3: Baixar som grátis**
1. Site: https://freesound.org/
2. Busque: "notification ding"
3. Baixe
4. Renomeie para: `notification.mp3`
5. Coloque em: `public/notification.mp3`

### Funciona sem o arquivo?
✅ SIM! O sistema tem fallback.
- Desktop: Continua funcionando (sem som)
- Mobile: Vibra

### Badge piscando funciona?
✅ SIM! Sempre funciona.
- Título da aba pisca: "🔴 NOVO PEDIDO!"
- Funciona com ou sem som
