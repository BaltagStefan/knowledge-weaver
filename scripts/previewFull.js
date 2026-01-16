import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const loadEnvFile = () => {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return {};

  const env = {};
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const line = trimmed.startsWith('export ') ? trimmed.slice(7).trim() : trimmed;
    const idx = line.indexOf('=');
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
};

const envFromFile = loadEnvFile();
const mergedEnv = { ...envFromFile, ...process.env };

const spawnShell = (command) =>
  spawn(command, { stdio: 'inherit', shell: true, env: mergedEnv });

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
