@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   SGF - Parar Todos os Servicos (Portas 3333 e 3000)
echo ========================================================

echo A verificar e encerrar servicos na porta 3333 (API)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3333" ^| findstr "LISTENING"') do (
    echo   - Finalizando PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

echo A verificar e encerrar servicos na porta 3000 (WEB)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo   - Finalizando PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Todos os servicos foram terminados e as portas 3333 e 3000 estao livres.
pause
