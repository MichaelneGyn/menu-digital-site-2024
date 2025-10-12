@echo off
echo.
echo ========================================
echo    DESCOBRIR MEU IP PARA TESTAR MOBILE
echo ========================================
echo.
ipconfig | findstr /i "IPv4"
echo.
echo ========================================
echo Copie o IP acima e acesse no celular:
echo http://[SEU_IP]:3001
echo.
echo Exemplo: http://192.168.1.10:3001
echo ========================================
echo.
pause
