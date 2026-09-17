@echo off
cd /d "%~dp0"
echo ===================================================
echo     Bharat One - Stop GitHub Auto-Sync
echo ===================================================
echo.
if exist "%~dp0scripts\.auto-sync.pid" (
    set /p SYNC_PID=<"%~dp0scripts\.auto-sync.pid"
    taskkill /PID %SYNC_PID% /F >nul 2>&1
    del /f /q "%~dp0scripts\.auto-sync.pid" >nul 2>&1
    echo [SUCCESS] Auto-Sync background process (PID %SYNC_PID%) has been stopped.
) else (
    echo [INFO] Auto-Sync is not currently running.
)
echo.
pause
