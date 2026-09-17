@echo off
cd /d "%~dp0"
echo ===================================================
echo     Bharat One - GitHub Automatic Synchronization
echo ===================================================
echo.
wscript "%~dp0scripts\run-sync-hidden.vbs"
timeout /t 2 /nobreak >nul
if exist "%~dp0scripts\.auto-sync.pid" (
    set /p SYNC_PID=<"%~dp0scripts\.auto-sync.pid"
    echo [SUCCESS] Auto-Sync is actively running in the background!
    echo Process PID: %SYNC_PID%
    echo Remote Repo: https://github.com/dishantvishwa30905-svg/Bharat-one.git
    echo Branch:      main
    echo.
    echo Any file save will automatically commit and push within 10-15 seconds.
    echo Log file:    .git\auto-sync.log
) else (
    echo [INFO] Starting auto-sync process...
)
echo.
pause
