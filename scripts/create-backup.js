const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = 'C:\\bharat one';
const desktopDir = 'C:\\Users\\lenovo\\OneDrive\\Desktop';
const documentsDir = 'C:\\Users\\lenovo\\Documents\\Bharat-One-Backups';

console.log('=== Saving Bharat One to System ===');

// 1. Create Desktop Shortcut to Project Folder
try {
  const shortcutFile = path.join(desktopDir, 'Bharat One Project.lnk');
  const psCmd = `
$ws = New-Object -ComObject WScript.Shell
$sc = $ws.CreateShortcut('${shortcutFile.replace(/\\/g, '\\\\')}')
$sc.TargetPath = '${projectRoot.replace(/\\/g, '\\\\')}'
$sc.WorkingDirectory = '${projectRoot.replace(/\\/g, '\\\\')}'
$sc.Description = 'Bharat One Full Stack Project'
$sc.Save()
`;
  execSync(`powershell -NoProfile -Command "${psCmd.replace(/\n/g, '; ')}"`);
  console.log('✔ Created Desktop shortcut at:', shortcutFile);
} catch (e) {
  console.log('Note on shortcut:', e.message);
}

// 2. Create Documents backup folder
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

// 3. Create zip backup on Desktop using PowerShell Compress-Archive
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const zipDesktop = path.join(desktopDir, `Bharat-One-Backup.zip`);
const zipArchive = path.join(documentsDir, `Bharat-One-Backup-${timestamp}.zip`);

try {
  console.log('Creating ZIP archive of project source code (excluding node_modules and .next)...');
  
  // Temporary staging list or git archive
  // Using git archive ensures 100% clean, exact snapshot of all project files
  execSync(`git archive --format=zip --output="${zipDesktop}" HEAD`, { cwd: projectRoot });
  fs.copyFileSync(zipDesktop, zipArchive);

  console.log('✔ Saved clean ZIP backup to Desktop:', zipDesktop);
  console.log('✔ Saved archive timestamped copy to Documents:', zipArchive);
} catch (err) {
  console.error('Error creating zip backup:', err.message);
}

console.log('\nProject Location on your PC: C:\\bharat one');
