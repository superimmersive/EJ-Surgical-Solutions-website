import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

export function loadEnv() {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const envPath = join(root, '.env');

  if (!existsSync(envPath)) {
    throw new Error('Missing .env file. Copy .env.example to .env and add your credentials.');
  }

  const env = {};
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }

  // Allow one-off overrides from the shell (e.g. TRANSPHARM_USER=email npm run transpharm-otp)
  for (const key of [
    'TRANSPHARM_USER',
    'TRANSPHARM_PASSWORD',
    'TRANSPHARM_OTP',
    'TRANSPHARM_CLIENT_ID',
    'TRANSPHARM_CLIENT_SECRET',
  ]) {
    if (process.env[key]) env[key] = process.env[key];
  }

  if (!env.TRANSPHARM_USER) {
    throw new Error('TRANSPHARM_USER must be set in .env (mobile or email used at transpharm.co.za/login).');
  }

  env.TRANSPHARM_BASE_URL = env.TRANSPHARM_BASE_URL || 'https://www.transpharm.co.za';
  env.TRANSPHARM_REGION = env.TRANSPHARM_REGION || 'tp_za';
  env.TRANSPHARM_CLIENT_ID = env.TRANSPHARM_CLIENT_ID || 'spartacus_client_transpharm';
  env.TRANSPHARM_CLIENT_SECRET = env.TRANSPHARM_CLIENT_SECRET || 'secret';

  return env;
}
