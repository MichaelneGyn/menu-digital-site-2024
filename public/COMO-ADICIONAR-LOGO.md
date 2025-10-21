# Como Adicionar o Logo Virtual Cardápio

## Passos para adicionar a imagem:

1. **Salve a imagem do logo** que você mostrou como:
   - `logo.png` ou `logo.svg` (preferência por SVG para melhor qualidade)
   - ou `virtual-cardapio-logo.png`

2. **Cole o arquivo nesta pasta:**
   ```
   public/
   ```

3. **Usar no código:**
   ```tsx
   // Para usar em qualquer componente:
   <img src="/logo.png" alt="Virtual Cardápio" />
   
   // Ou com Next.js Image:
   import Image from 'next/image'
   <Image src="/logo.png" alt="Virtual Cardápio" width={200} height={200} />
   ```

## Localização:
- O arquivo deve ficar em: `public/logo.png`
- No código, você referencia apenas como: `/logo.png`

## Formatos recomendados:
- **SVG**: Melhor qualidade, escalável
- **PNG**: Com fundo transparente
- **JPG**: Se não precisar de transparência

## Tamanho recomendado:
- Logo principal: 512x512px
- Favicon: 32x32px ou 64x64px
