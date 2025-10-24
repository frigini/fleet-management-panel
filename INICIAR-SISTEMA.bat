@echo off
title Sistema de Gerenciamento de Frota
color 0A

echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║                                                              ║
echo  ║          🚛 SISTEMA DE GERENCIAMENTO DE FROTA 🚛             ║
echo  ║                                                              ║
echo  ║              Inicializacao Automatica                       ║
echo  ║                                                              ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.

echo ⚠️  IMPORTANTE: Certifique-se de que o Node.js esta instalado!
echo    Baixe em: https://nodejs.org
echo.

echo 🔄 Iniciando componentes do sistema...
echo.

echo 📊 1. Iniciando servidor backend (porta 5000)...
start "Backend - Servidor" cmd /k "cd /d "%~dp0" && iniciar-servidor.bat"

echo ⏳ Aguardando 5 segundos para o servidor inicializar...
timeout /t 5 /nobreak >nul

echo 🌐 2. Iniciando interface web (porta 3000)...
start "Frontend - Interface Web" cmd /k "cd /d "%~dp0" && iniciar-frontend.bat"

echo.
echo ✅ Sistema iniciado com sucesso!
echo.
echo 📱 Acesse o sistema em: http://localhost:3000
echo 🔧 API do servidor em: http://localhost:5000/api
echo.
echo 💡 DICAS:
echo    • Aguarde alguns segundos para tudo carregar
echo    • Se houver erro, verifique se o Node.js esta instalado
echo    • Para parar o sistema, feche as janelas do terminal
echo.

echo 🌐 Abrindo navegador automaticamente em 3 segundos...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo ✨ Sistema pronto para uso!
echo    Pressione qualquer tecla para fechar esta janela...
pause >nul
