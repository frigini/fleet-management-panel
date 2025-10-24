@echo off
echo ========================================
echo   SISTEMA DE GERENCIAMENTO DE FROTA
echo   Iniciando Interface Web...
echo ========================================
echo.

cd /d "%~dp0frontend"

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
echo Iniciando interface web na porta 3000...
echo O navegador sera aberto automaticamente
echo Pressione Ctrl+C para parar a interface
echo.

call npm run dev

pause
