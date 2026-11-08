@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   SGF - Iniciar Servico de Backend (API)
echo ========================================================

:: 1. Matar qualquer processo escutando na porta 3333
echo [1/3] A verificar e encerrar processos existentes na porta 3333...
set KILLED=0
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3333" ^| findstr "LISTENING"') do (
    echo   - A finalizar processo PID: %%a
    taskkill /F /PID %%a >nul 2>&1
    set KILLED=1
)

if "!KILLED!"=="1" (
    echo   Porta 3333 libertada com sucesso.
    ping 127.0.0.1 -n 2 >nul
) else (
    echo   Nenhum processo anterior a ocupar a porta 3333.
)

:: 2. Garantir que a base de dados MySQL (Docker) esta ativa
echo [2/3] A verificar container da base de dados MySQL (sgf-mysql)...
docker start sgf-mysql >nul 2>&1

:: 3. Configurar ambiente e iniciar a API
echo [3/3] A iniciar o servidor da API SGF na porta 3333...
set "PATH=C:\Program Files\nodejs;C:\Program Files\Git\cmd;%LOCALAPPDATA%\Programs\DockerDesktop\resources\bin;%PATH%"
set "PORT=3333"

cd /d D:\Projectos\SGF\sgf-api
npm.cmd run dev
