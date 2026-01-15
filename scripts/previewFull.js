import { spawn } from 'node:child_process';

const spawnShell = (command) =>
  spawn(command, { stdio: 'inherit', shell: true });

const modeArg = process.argv[2];
const mode = modeArg === 'dev' ? 'dev' : 'preview';
const frontendCommand = mode === 'dev' ? 'npm run dev' : 'npm run preview';

const receiver = spawnShell('node server/n8nReceiver.js');
const frontend = spawnShell(frontendCommand);

let shuttingDown = false;

const shutdown = (code = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;
  if (receiver && !receiver.killed) receiver.kill('SIGTERM');
  if (frontend && !frontend.killed) frontend.kill('SIGTERM');
  process.exit(code);
};

receiver.on('exit', (code) => {
  if (code && code !== 0) {
    shutdown(code);
    return;
  }
  shutdown(frontend.exitCode ?? 0);
});

frontend.on('exit', (code) => {
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

frontend.on('error', (error) => {
  console.error(`[preview:full] ${mode} failed to start:`, error);
  shutdown(1);
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
