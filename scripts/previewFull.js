import { spawn } from 'node:child_process';

const spawnShell = (command) =>
  spawn(command, { stdio: 'inherit', shell: true });

const receiver = spawnShell('node server/n8nReceiver.js');
const preview = spawnShell('npm run preview');

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

receiver.on('error', (error) => {
  console.error('[preview:full] receiver failed to start:', error);
  shutdown(1);
});

preview.on('error', (error) => {
  console.error('[preview:full] preview failed to start:', error);
  shutdown(1);
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
