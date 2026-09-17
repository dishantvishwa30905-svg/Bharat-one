@echo off
cd /d "%~dp0"
echo ===================================================
echo   Enable Bharat One Auto-Sync on Windows Startup
echo ===================================================
echo.
powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([Environment]::GetFolderPath('Startup') + '\BharatOne-AutoSync.lnk'); $s.TargetPath = 'wscript.exe'; $s.Arguments = '\"%~dp0scripts\run-sync-hidden.vbs\"'; $s.WorkingDirectory = '%~dp0'; $s.Save()"
echo [SUCCESS] Auto-Sync shortcut added to your Windows Startup folder!
echo It will now run automatically whenever you turn on or restart your computer.
echo.
pause
