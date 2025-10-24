@echo off
echo ========================================
echo   SISTEMA DE GERENCIAMENTO DE FROTA
echo   Iniciando Servidor Backend...
echo ========================================
echo.

cd /d "%~dp0backend"

echo Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias pela primeira vez...
    call npm install
    if errorlevel 1 (
        echo ERRO: Falha ao instalar dependencias!
        echo Certifique-se de que o Node.js esta instalado.
        pause
        exit /b 1
    )
)

echo.
echo Iniciando servidor na porta 5000...
echo Pressione Ctrl+C para parar o servidor
echo.

call npm run dev

pause
