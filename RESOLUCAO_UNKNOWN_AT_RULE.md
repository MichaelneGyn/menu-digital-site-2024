# Resolução dos Erros "Unknown at rule" no VS Code

## Problema
O VS Code estava mostrando erros "Unknown at rule" para as diretivas do Tailwind CSS como `@tailwind`, `@layer`, `@apply`, etc.

## Solução Implementada

Foram criados os seguintes arquivos de configuração na pasta `.vscode/`:

### 1. `.vscode/settings.json`
- Desabilita a validação CSS padrão do VS Code
- Configura dados customizados para CSS
- Ignora regras CSS desconhecidas
- Associa arquivos `.css` com Tailwind CSS

### 2. `.vscode/css_custom_data.json`
- Define as diretivas do Tailwind CSS (`@tailwind`, `@layer`, `@apply`, etc.)
- Fornece documentação para cada diretiva

### 3. `.vscode/extensions.json`
- Recomenda a instalação da extensão "Tailwind CSS IntelliSense"

## Como Aplicar a Solução

1. **Reinicie o VS Code** completamente (feche e abra novamente)
2. **Instale a extensão recomendada**:
   - Vá em Extensions (Ctrl+Shift+X)
   - Procure por "Tailwind CSS IntelliSense"
   - Instale a extensão oficial da Tailwind Labs

3. **Recarregue a janela**:
   - Pressione `Ctrl+Shift+P`
   - Digite "Developer: Reload Window"
   - Pressione Enter

## Verificação

Após seguir os passos acima:
- Os erros "Unknown at rule" devem desaparecer da aba Problems
- O IntelliSense do Tailwind deve funcionar nos arquivos CSS
- As diretivas `@tailwind`, `@layer`, `@apply` devem ser reconhecidas

## Arquivos Afetados

- ✅ `.vscode/settings.json` - Criado
- ✅ `.vscode/css_custom_data.json` - Criado  
- ✅ `.vscode/extensions.json` - Criado

Todos os arquivos de configuração foram criados e estão prontos para uso.