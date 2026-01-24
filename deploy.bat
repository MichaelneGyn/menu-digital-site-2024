@echo off
echo.
echo ========================================
echo   FAZENDO DEPLOY
echo ========================================
echo.

echo [1/3] Adicionando arquivos...
git add .

echo.
echo [2/3] Criando commit...
git commit -m "Remover botao demo"

echo.
echo [3/3] Enviando para producao...
git push

echo.
echo ========================================
echo   DEPLOY INICIADO!
echo ========================================
echo.
echo Aguarde 2-3 minutos e acesse:
echo https://virtualcardapio.com.br
echo.
pause
