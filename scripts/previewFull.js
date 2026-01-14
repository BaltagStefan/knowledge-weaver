import { spawn } from 'node:child_process';

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const nodeCmd = process.execPath;

const receiver = spawn(nodeCmd, ['server/n8nReceiver.js'], { stdio: 'inherit' });
const preview = spawn(npmCmd, ['run', 'preview'], { stdio: 'inherit' });

let shuttingDown = false;

const shutdown = (code = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;
  if (receiver && !receiver.killed) receiver.kill('SIGTERM');
  if (preview && !preview.killed) preview.kill('SIGTERM');
  process.exit(code);
};

receiver.on('exit', (code) => {
  if (code && code !== 0) {
    shutdown(code);
    return;
  }
  shutdown(preview.exitCode ?? 0);
});

preview.on('exit', (code) => {
  if (code && code !== 0) {
    shutdown(code);
    return;
  }
  shutdown(receiver.exitCode ?? 0);
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
