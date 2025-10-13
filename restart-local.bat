@echo off
echo ========================================
echo REINICIANDO SERVIDOR LOCAL
echo ========================================
echo.

echo [1/3] Parando todos os processos Node...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo [2/3] Limpando cache e reconstruindo...
call npm run build

echo.
echo [3/3] Iniciando servidor na porta 3001...
call npm run dev

echo.
echo ========================================
echo SERVIDOR REINICIADO COM SUCESSO!
echo Acesse: http://localhost:3001
echo ========================================
pause
