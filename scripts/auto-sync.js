const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_DIR = path.resolve(__dirname, '..');
const PID_FILE = path.join(__dirname, '.auto-sync.pid');
const LOG_FILE = path.join(PROJECT_DIR, '.git', 'auto-sync.log');

const CHECK_INTERVAL_MS = 3000; // Check every 3 seconds
const DEBOUNCE_MS = 10000;       // Wait 10 seconds of stability before committing and pushing
const BRANCH = 'main';
const REMOTE = 'origin';

let lastChangeDetectedAt = 0;
let isSyncing = false;
let pendingChanges = false;
let previousStatus = '';

function log(msg) {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const formatted = `[${timestamp}] ${msg}`;
  console.log(formatted);
  try {
    fs.appendFileSync(LOG_FILE, formatted + '\n');
  } catch (_) {}
}

function runGit(command) {
  return execSync(`git ${command}`, {
    cwd: PROJECT_DIR,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    windowsHide: true,
  }).trim();
}

function getGitStatus() {
  try {
    return runGit('status --porcelain');
  } catch (err) {
    log(`Error checking git status: ${err.message}`);
    return '';
  }
}

function performSync() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    log('Starting automatic sync...');

    // 1. Double check safety - check status
    const statusBefore = getGitStatus();
    if (!statusBefore) {
      log('No changes found to commit.');
      isSyncing = false;
      pendingChanges = false;
      previousStatus = '';
      return;
    }

    // 2. Stage changes
    runGit('add -A');

    // 3. Check what is staged
    const staged = runGit('status --porcelain');
    if (!staged) {
      log('Nothing staged to commit.');
      isSyncing = false;
      pendingChanges = false;
      previousStatus = '';
      return;
    }

    // Safety verification: check if any .env or secret file slipped in
    const stagedLines = staged.split('\n');
    const secretDetected = stagedLines.some(line => {
      const file = line.substring(3).trim();
      return file === '.env' || (file.startsWith('.env.') && !file.endsWith('.example'));
    });

    if (secretDetected) {
      log('SECURITY ALERT: Attempted to stage a .env or secret file! Aborting commit.');
      runGit('reset');
      isSyncing = false;
      pendingChanges = false;
      previousStatus = '';
      return;
    }

    // 4. Create commit
    const dateStr = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const commitMsg = `Auto-sync: updated Bharat One project (${dateStr})`;
    runGit(`commit -m "${commitMsg}"`);
    const commitHash = runGit('rev-parse --short HEAD');
    log(`Committed: ${commitHash} - "${commitMsg}"`);

    // 5. Push commit (standard push, never force)
    log(`Pushing to ${REMOTE}/${BRANCH}...`);
    runGit(`push ${REMOTE} ${BRANCH}`);
    log(`Successfully pushed ${commitHash} to GitHub (${REMOTE}/${BRANCH})!`);

    pendingChanges = false;
    previousStatus = '';
  } catch (err) {
    log(`Sync error: ${err.stderr || err.message}`);
  } finally {
    isSyncing = false;
  }
}

// Single instance check via PID file
try {
  if (fs.existsSync(PID_FILE)) {
    const existingPid = parseInt(fs.readFileSync(PID_FILE, 'utf8'), 10);
    if (!isNaN(existingPid)) {
      try {
        process.kill(existingPid, 0); // Check if process is alive
        console.log(`[Auto-Sync] Already running with PID ${existingPid}. Exiting duplicate.`);
        process.exit(0);
      } catch (_) {
        // Process is dead, remove stale PID file
        fs.unlinkSync(PID_FILE);
      }
    }
  }
  fs.writeFileSync(PID_FILE, process.pid.toString(), 'utf8');
} catch (_) {}

function cleanup() {
  try {
    if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
  } catch (_) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', () => {
  try {
    if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
  } catch (_) {}
});

log('Bharat One GitHub Auto-Sync watcher started.');
log(`Watching ${PROJECT_DIR} (debounce: ${DEBOUNCE_MS / 1000}s, check interval: ${CHECK_INTERVAL_MS / 1000}s)`);

// Periodic polling loop
setInterval(() => {
  if (isSyncing) return;

  const currentStatus = getGitStatus();

  if (currentStatus) {
    if (currentStatus !== previousStatus) {
      log('Changes detected! Waiting for debounce quiet period before syncing...');
      previousStatus = currentStatus;
      lastChangeDetectedAt = Date.now();
      pendingChanges = true;
    } else if (pendingChanges) {
      const elapsed = Date.now() - lastChangeDetectedAt;
      if (elapsed >= DEBOUNCE_MS) {
        log(`Changes stable for ${Math.round(elapsed / 1000)}s. Triggering sync...`);
        performSync();
      }
    }
  } else {
    pendingChanges = false;
    previousStatus = '';
  }
}, CHECK_INTERVAL_MS);
