/**
 * Transpharm OTP login — step 2: verify OTP and obtain access token.
 * Run: npm run transpharm-verify-otp
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { loadEnv } from './load-env.mjs';

const OCC = '/occ/v2/transpharm';

function dslHeaders(identifier, bearer) {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'use-dsl-authentication': 'true',
    'User-Agent': 'Mozilla/5.0',
  };
  if (identifier) headers.identifier = identifier;
  if (bearer) headers.Authorization = `Bearer ${bearer}`;
  return headers;
}

async function verifyOtp(base, { identifier, reference, otp, bearer }) {
  const url = `${base}${OCC}/dsl/brands/checkers/countries/ZA/otp/verify`;
  const body = {
    target: {
      type: identifier.includes('@') ? 'EMAIL' : 'SMS',
      identifier,
      reference,
    },
    otp,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: dslHeaders(identifier, bearer),
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { ok: res.ok, status: res.status, data };
}

export async function verifyTranspharmOtp(env) {
  if (!env.TRANSPHARM_OTP) {
    throw new Error('Set TRANSPHARM_OTP in .env with the code from your SMS.');
  }

  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const sessionPath = join(root, '.transpharm-otp-session.json');

  if (!existsSync(sessionPath)) {
    throw new Error('Missing OTP session. Run npm run transpharm-otp first.');
  }

  const session = JSON.parse(readFileSync(sessionPath, 'utf8'));
  const base = env.TRANSPHARM_BASE_URL.replace(/\/$/, '');

  const reference =
    session.reference ||
    session.generateResponse?.reference ||
    session.generateResponse?.response?.reference;

  if (!reference) {
    throw new Error('No OTP reference in session — re-run npm run transpharm-otp');
  }

  console.log('Verifying OTP...\n');

  const result = await verifyOtp(base, {
    identifier: session.identifier,
    reference,
    otp: env.TRANSPHARM_OTP.trim(),
    bearer: session.dslToken,
  });

  if (!result.ok) {
    throw new Error(`OTP verification failed (${result.status}): ${JSON.stringify(result.data).slice(0, 400)}`);
  }

  const tokenPath = join(root, '.transpharm-token.json');
  writeFileSync(
    tokenPath,
    JSON.stringify(
      {
        verifiedAt: new Date().toISOString(),
        identifier: session.identifier,
        response: result.data,
        accessToken:
          result.data?.response?.accessToken ||
          result.data?.accessToken ||
          result.data?.access_token,
      },
      null,
      2
    )
  );

  console.log('✓ OTP verified — session saved to .transpharm-token.json');
  console.log('  Run npm run sync-prices to pull B2B pricing.\n');

  return result.data;
}

async function main() {
  const env = loadEnv();
  await verifyTranspharmOtp(env);
}

if (process.argv[1]?.includes('transpharm-verify-otp')) {
  main().catch((err) => {
    console.error('\nError:', err.message);
    process.exit(1);
  });
}
