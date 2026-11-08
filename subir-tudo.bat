@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   SGF - Iniciar Todos os Servicos do Sistema
echo ========================================================

:: 1. Limpar processos antigos
echo [1/4] A encerrar processos antigos nas portas 3333 e 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3333" ^| findstr "LISTENING"') do (
    echo   - Finalizando processo na porta 3333: %%a
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo   - Finalizando processo na porta 3000: %%a
    taskkill /F /PID %%a >nul 2>&1
)
ping 127.0.0.1 -n 2 >nul

:: 2. Base de Dados Docker
echo [2/4] A certificar que o container MySQL (sgf-mysql) esta ativo...
docker start sgf-mysql >nul 2>&1

:: 3. Iniciar API numa nova janela
echo [3/4] A abrir servico da API (porta 3333)...
start "SGF API - Porta 3333" cmd /k "cd /d D:\Projectos\SGF && subir-api.bat"

:: 4. Aguardar 4 segundos e iniciar Frontend Web
echo [4/4] A abrir servico WEB (porta 3000)...
ping 127.0.0.1 -n 4 >nul
start "SGF Web - Porta 3000" cmd /k "cd /d D:\Projectos\SGF && subir-web.bat"

echo.
echo ========================================================
echo   Servicos disparados com sucesso!
echo   - Backend API: http://localhost:3333
echo   - Frontend Web: http://localhost:3000/material-dashboard-react/
echo ========================================================
