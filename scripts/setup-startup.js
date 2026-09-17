const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

const startupDir = path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');
const shortcutPath = path.join(startupDir, 'BharatOne-AutoSync.lnk');
const vbsPath = path.resolve(__dirname, 'run-sync-hidden.vbs');
const projectDir = path.resolve(__dirname, '..');

const psScript = `
$ws = New-Object -ComObject WScript.Shell
$s = $ws.CreateShortcut('${shortcutPath.replace(/\\/g, '\\\\')}')
$s.TargetPath = 'wscript.exe'
$s.Arguments = '"${vbsPath.replace(/\\/g, '\\\\')}"'
$s.WorkingDirectory = '${projectDir.replace(/\\/g, '\\\\')}'
$s.Save()
`;

try {
  execSync(`powershell -NoProfile -Command "${psScript.replace(/\n/g, '; ')}"`, { stdio: 'inherit' });
  console.log('[SUCCESS] Startup shortcut created at: ' + shortcutPath);
} catch (err) {
  console.error('[ERROR] Could not create startup shortcut:', err.message);
}
