# DIAGNOSTICO COMPLETO - POR QUE STICKY NAO FUNCIONA

## TESTE 1: ARQUIVO HTML PURO

Criei um arquivo teste-sticky.html

### Como testar:

1. Abra o arquivo no navegador:
   - Clique duplo em teste-sticky.html
   - OU arraste para o navegador

2. Faca scroll para baixo

3. A barra DEVE ficar fixa no topo

### Se funcionar no HTML puro:
O problema esta no Next.js ou no CSS do projeto

### Se NAO funcionar no HTML puro:
O problema esta no navegador ou sistema

## TESTE 2: VERIFICAR NAVEGADOR

### Navegadores que suportam sticky:
- Chrome 56+
- Firefox 59+
- Safari 13+
- Edge 16+

### Como verificar versao:
- Chrome: chrome://version
- Firefox: about:support
- Edge: edge://version

### Se navegador antigo:
Atualizar para versao mais recente

## TESTE 3: VERIFICAR CSS NO DEVTOOLS

### Passo a passo:

1. Abrir site: localhost:3000/x-lanches

2. Pressionar F12 (DevTools)

3. Clicar em Elements/Elementos

4. Inspecionar a barra de categorias

5. Ver aba Computed

6. Procurar por:
   - position: sticky (DEVE TER)
   - top: 0px (DEVE TER)
   - z-index: 9999 (DEVE TER)

### Se position NAO for sticky:
Algum CSS esta sobrescrevendo

### Se position for sticky mas nao funciona:
Elemento pai tem problema

## TESTE 4: VERIFICAR ELEMENTO PAI

### No DevTools:

1. Inspecionar elemento pai (div.min-h-screen)

2. Ver Computed

3. Procurar por:
   - overflow: visible (DEVE TER)
   - overflow-x: hidden (OK)
   - overflow-y: auto (OK)
   - position: relative (DEVE TER)

### Se overflow for hidden:
Isso quebra o sticky!

### Solucao:
Adicionar no CSS:
```css
.min-h-screen {
  overflow: visible !important;
}
```

## TESTE 5: VERIFICAR HIERARQUIA HTML

### Estrutura correta:

```html
<body>
  <div class="min-h-screen">
    <header>Banner</header>
    <nav class="category-sticky-menu">Categorias</nav>
    <main>Conteudo</main>
  </div>
</body>
```

### Estrutura ERRADA (quebra sticky):

```html
<body>
  <div style="overflow: hidden">
    <div class="min-h-screen">
      <nav class="category-sticky-menu">Categorias</nav>
    </div>
  </div>
</body>
```

## TESTE 6: VERIFICAR CACHE

### Limpar cache Next.js:

```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

### Limpar cache navegador:

1. Ctrl + Shift + Delete
2. Marcar: Cache/Imagens
3. Limpar
4. Fechar e reabrir navegador

### Testar em modo anonimo:

Ctrl + Shift + N (Chrome)

## TESTE 7: VERIFICAR PRODUCAO

### Se funciona local mas nao em producao:

1. Fazer deploy:
```powershell
git add .
git commit -m "test sticky"
git push origin master
```

2. Aguardar 2-3 minutos

3. Testar em producao

4. Limpar cache do navegador

## POSSÍVEIS CAUSAS:

### 1. OVERFLOW HIDDEN NO PAI (mais comum)
Solucao: overflow: visible

### 2. POSITION FIXED/ABSOLUTE NO PAI
Solucao: position: relative

### 3. TRANSFORM NO PAI
Solucao: Remover transform

### 4. CONTAIN NO PAI
Solucao: contain: none

### 5. CACHE DO NAVEGADOR
Solucao: Limpar cache

### 6. NAVEGADOR ANTIGO
Solucao: Atualizar navegador

### 7. CSS CONFLITANTE
Solucao: Usar !important

## SOLUCAO FORCADA:

Se nada funcionar, adicionar no globals.css:

```css
/* FORCAR STICKY - ULTIMA TENTATIVA */
.category-sticky-menu {
  position: -webkit-sticky !important;
  position: sticky !important;
  top: 0 !important;
  z-index: 99999 !important;
}

.min-h-screen {
  overflow: visible !important;
  contain: none !important;
  transform: none !important;
}

body, html {
  overflow-x: hidden !important;
  overflow-y: auto !important;
}
```

## COMANDOS RAPIDOS:

### Limpar tudo e testar:
```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

### Abrir em modo anonimo:
Ctrl + Shift + N

### Ver console:
F12 > Console

### Inspecionar elemento:
F12 > Elements

## RESULTADO ESPERADO:

Ao fazer scroll:
1. Barra fica fixa no topo
2. Nao some
3. Categoria ativa atualiza
4. Igual ao exemplo do HTML puro

TESTE O ARQUIVO teste-sticky.html PRIMEIRO!
