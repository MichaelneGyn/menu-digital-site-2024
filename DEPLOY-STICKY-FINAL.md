# DEPLOY FINAL - STICKY CORRIGIDO

## O QUE FOI FEITO:

### 1. Simplificado o CSS inline do componente
- Removido propriedades conflitantes
- Mantido apenas o essencial

### 2. Forcado CSS global com seletor especifico
```css
nav.category-sticky-menu,
.category-sticky-menu {
  position: sticky !important;
  top: 0 !important;
  z-index: 1000 !important;
}
```

### 3. Garantido que elemento pai nao interfira
```css
.min-h-screen {
  overflow: visible !important;
}
```

## FAZER DEPLOY:

### Passo 1: Commit
```powershell
cd "c:\Users\Administrator\Desktop\MENU DIGITAL\menu-digital-site-2024-8773d37d606448f665f364adadb0de35da0262ad"

git add .
git commit -m "fix: sticky menu final - CSS forcado com seletor especifico"
git push origin master
```

### Passo 2: Aguardar deploy (2-3 minutos)
Abrir: https://vercel.com/dashboard

### Passo 3: Limpar cache do navegador
1. Ctrl + Shift + Delete
2. Limpar cache
3. Fechar navegador
4. Reabrir

### Passo 4: Testar em modo anonimo
```
Ctrl + Shift + N
https://virtualcardapio.com.br/x-lanches
```

### Passo 5: Fazer scroll
- Barra DEVE ficar fixa no topo
- Nao deve sumir

## SE AINDA NAO FUNCIONAR:

### Verificar no DevTools (F12):

1. Elements tab
2. Inspecionar barra
3. Computed tab
4. Procurar por: position

Se aparecer algo diferente de "sticky", significa que:
- Algum CSS esta sobrescrevendo
- Elemento pai tem problema

### Solucao extrema:

Adicionar no inicio do globals.css:

```css
/* FORCAR STICKY - PRIORIDADE MAXIMA */
nav[class*="category"] {
  position: sticky !important;
  top: 0 !important;
  z-index: 9999 !important;
}
```

## COMANDOS COMPLETOS:

```powershell
# 1. Ir para pasta do projeto
cd "c:\Users\Administrator\Desktop\MENU DIGITAL\menu-digital-site-2024-8773d37d606448f665f364adadb0de35da0262ad"

# 2. Commit e push
git add .
git commit -m "fix: sticky menu final"
git push origin master

# 3. Aguardar 2-3 minutos

# 4. Testar
# Abrir modo anonimo: Ctrl + Shift + N
# URL: https://virtualcardapio.com.br/x-lanches
```

PRONTO! AGORA DEVE FUNCIONAR!
