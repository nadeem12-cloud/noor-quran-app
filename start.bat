@echo off
setlocal
cd /d "%~dp0"

if not exist node_modules (
    echo First-time setup: installing dependencies. This can take a minute...
    call npm install
    if errorlevel 1 (
        echo.
        echo npm install failed. Make sure Node.js is installed: https://nodejs.org
        echo Then double-click this file again.
        pause
        exit /b 1
    )
)

REM Open the browser a few seconds after launch, once the server is ready.
start "" /min cmd /c "timeout /t 5 /nobreak >nul & start http://localhost:5173"

echo Starting Noor...
echo This window IS the server - keep it open while you use the app.
echo Close this window (or press Ctrl+C) to stop it.
echo.
call npm run dev

pause
