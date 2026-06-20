/**
 * Transpharm / Shoprite DSL OTP login — step 1: request OTP.
 * Run: npm run transpharm-otp
 *
 * Step 2 (after SMS arrives): set TRANSPHARM_OTP in .env and run npm run transpharm-verify-otp
 */
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { loadEnv } from './load-env.mjs';

const OCC = '/occ/v2/transpharm';
const OTP_GENERATE =
  '/dsl/brands/checkers/countries/ZA/otp/generate';
const LOGIN_USER =
  '/dsl/brands/checkers/countries/ZA/users/loginUser';

function identifierVariants(value) {
  const trimmed = value.trim();
  const variants = [trimmed];

  if (trimmed.startsWith('0') && !trimmed.includes('@')) {
    variants.push(`+27${trimmed.slice(1)}`);
  } else if (/^\d{9}$/.test(trimmed)) {
    variants.push(`0${trimmed}`, `+27${trimmed}`);
  } else if (trimmed.startsWith('+27')) {
    variants.push(`0${trimmed.slice(3)}`, trimmed.slice(3));
  }

  if (trimmed.includes('@')) {
    variants.push(trimmed.toLowerCase());
  }

  return [...new Set(variants)];
}

function maskIdentifier(value) {
  if (value.includes('@')) {
    const [user, domain] = value.split('@');
    return `${user.slice(0, 2)}***@${domain}`;
  }
  return value.replace(/.(?=.{4})/g, '*');
}

function dslHeaders(identifier) {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'use-dsl-authentication': 'true',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  };
  if (identifier) {
    headers.identifier = identifier;
  }
  return headers;
}

async function loginUser(base, identifier) {
  const url =
    `${base}${OCC}${LOGIN_USER}?identifier=${encodeURIComponent(identifier)}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: dslHeaders(identifier),
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

async function generateOtp(base, identifier) {
  const url = `${base}${OCC}${OTP_GENERATE}`;
  const body = {
    target: {
      type: identifier.includes('@') ? 'EMAIL' : 'SMS',
      identifier,
      targetIsVerified: false,
    },
    action: 'verify',
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: dslHeaders(),
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

export async function requestTranspharmOtp(env) {
  const base = env.TRANSPHARM_BASE_URL.replace(/\/$/, '');
  const variants = identifierVariants(env.TRANSPHARM_USER);

  console.log('Requesting Transpharm OTP (Shoprite DSL login)...\n');

  let lastError = '';

  for (const identifier of variants) {
    console.log(`Trying: ${maskIdentifier(identifier)}`);

    const userCheck = await loginUser(base, identifier);
    console.log(`  loginUser → ${userCheck.status}`);

    const otp = await generateOtp(base, identifier);
    if (otp.ok) {
      const reference =
        otp.data?.reference ||
        otp.data?.response?.reference ||
        otp.data?.target?.reference;

      const session = {
        identifier,
        reference,
        createdAt: new Date().toISOString(),
        generateResponse: otp.data,
      };

      const sessionPath = join(
        dirname(fileURLToPath(import.meta.url)),
        '..',
        '.transpharm-otp-session.json'
      );
      writeFileSync(sessionPath, JSON.stringify(session, null, 2));

      console.log('\n✓ OTP sent — check your phone or email for the code.');
      console.log('\nNext steps:');
      console.log('  1. Add TRANSPHARM_OTP=123456 to .env');
      console.log('  2. Run: npm run transpharm-verify-otp\n');
      return session;
    }

    lastError = `${maskIdentifier(identifier)}: ${otp.status} ${JSON.stringify(otp.data).slice(0, 200)}`;
    console.log(`  otp/generate → ${otp.status}`);
  }

  throw new Error(
    `Could not request OTP for any identifier format.\n${lastError}\n\n` +
      'Transpharm login uses SMS/email OTP (not password).\n' +
      'Set TRANSPHARM_USER to the exact mobile number or email shown on https://www.transpharm.co.za/login\n' +
      'If you normally log in with email, use that instead of your phone number.'
  );
}

async function main() {
  const env = loadEnv();
  await requestTranspharmOtp(env);
}

if (process.argv[1]?.includes('transpharm-otp-login')) {
  main().catch((err) => {
    console.error('\nError:', err.message);
    process.exit(1);
  });
}
