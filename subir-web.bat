@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   SGF - Iniciar Servico de Frontend (WEB)
echo ========================================================

:: 1. Matar qualquer processo escutando na porta 3000
echo [1/2] A verificar e encerrar processos existentes na porta 3000...
set KILLED=0
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo   - A finalizar processo PID: %%a
    taskkill /F /PID %%a >nul 2>&1
    set KILLED=1
)

if "!KILLED!"=="1" (
    echo   Porta 3000 libertada com sucesso.
    ping 127.0.0.1 -n 2 >nul
) else (
    echo   Nenhum processo anterior a ocupar a porta 3000.
)

:: 2. Configurar ambiente e iniciar a aplicacao Web
echo [2/2] A iniciar a aplicacao SGF Web na porta 3000...
set "PATH=C:\Program Files\nodejs;C:\Program Files\Git\cmd;%PATH%"
set "NODE_OPTIONS=--max-old-space-size=4096"
set "GENERATE_SOURCEMAP=false"
set "DISABLE_ESLINT_PLUGIN=true"

cd /d D:\Projectos\SGF\sgf-web
npm.cmd start
