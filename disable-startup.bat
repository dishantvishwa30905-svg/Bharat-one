@echo off
cd /d "%~dp0"
echo ===================================================
echo   Disable Bharat One Auto-Sync on Windows Startup
echo ===================================================
echo.
powershell -NoProfile -Command "Remove-Item -Path ([Environment]::GetFolderPath('Startup') + '\BharatOne-AutoSync.lnk') -ErrorAction SilentlyContinue"
echo [SUCCESS] Auto-Sync removed from Windows Startup.
echo.
pause
