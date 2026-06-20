/**
 * Shared Transpharm B2B OAuth token helper.
 * Supports password grant (legacy) and authorization-code + PKCE (JDK21 Spartacus).
 */
import { createHash, randomBytes } from 'crypto';

const TOKEN_PATH = '/authorizationserver/oauth/token';
const AUTHORIZE_PATH = '/authorizationserver/oauth/authorize';

const CLIENT_COMBOS = [
  { id: 'spartacus_client_transpharm', secret: 'secret' },
  { id: 'spartacus_client', secret: 'secret' },
];

function usernameVariants(user) {
  const variants = [user];
  const digits = user.replace(/\D/g, '');

  if (digits.length === 10 && digits.startsWith('0')) {
    variants.push(`+27${digits.slice(1)}`, digits.slice(1));
  } else if (digits.length === 9) {
    variants.push(`0${digits}`, `+27${digits}`);
  }

  if (user.includes('@')) {
    variants.push(user.toLowerCase());
  }

  return [...new Set(variants)];
}

function pkcePair() {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

async function requestToken(url, params, { clientId, clientSecret, useBasicAuth = true }) {
  const body = new URLSearchParams(params);
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json',
  };

  if (clientSecret && useBasicAuth) {
    headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
  }

  const res = await fetch(url, { method: 'POST', headers, body });
  const text = await res.text();

  if (!res.ok) {
    return { ok: false, status: res.status, text: text.slice(0, 400) };
  }

  try {
    const data = JSON.parse(text);
    if (data.access_token) {
      return { ok: true, token: data.access_token, data };
    }
  } catch {
    /* fall through */
  }

  return { ok: false, status: res.status, text: text.slice(0, 400) };
}

async function tryPasswordGrant(base, env, combo, username) {
  const url = `${base}${TOKEN_PATH}`;
  const params = {
    grant_type: 'password',
    client_id: combo.id,
    username,
    password: env.TRANSPHARM_PASSWORD,
  };

  if (combo.secret) {
    params.client_secret = combo.secret;
  }

  return requestToken(url, params, combo);
}

async function tryClientCredentials(base, combo) {
  if (!combo.secret) return { ok: false, status: 0, text: 'no secret' };

  const url = `${base}${TOKEN_PATH}`;
  return requestToken(
    url,
    {
      grant_type: 'client_credentials',
      client_id: combo.id,
      client_secret: combo.secret,
    },
    combo
  );
}

async function tryPkceLogin(base, env, combo) {
  if (!combo.secret && !combo.id.includes('public')) return null;

  const { verifier, challenge } = pkcePair();
  const redirectUri = `${base}/`;
  const state = randomBytes(16).toString('hex');

  const authorizeUrl =
    `${base}${AUTHORIZE_PATH}?` +
    new URLSearchParams({
      response_type: 'code',
      client_id: combo.id,
      redirect_uri: redirectUri,
      scope: 'basic openid',
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });

  const jar = {};

  const storeCookies = (res) => {
    const raw = res.headers.getSetCookie?.() || [];
    for (const c of raw) {
      const [pair] = c.split(';');
      const [k, ...v] = pair.split('=');
      jar[k.trim()] = v.join('=');
    }
  };

  const cookieHeader = () =>
    Object.entries(jar)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');

  // Bootstrap session
  let res = await fetch(base, {
    redirect: 'manual',
    headers: { Accept: 'text/html', 'User-Agent': 'Mozilla/5.0' },
  });
  storeCookies(res);

  // Try Spartacus OCC login endpoint
  for (const username of usernameVariants(env.TRANSPHARM_USER)) {
    const loginRes = await fetch(`${base}/occ/v2/transpharm/users/current/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        Cookie: cookieHeader(),
        'User-Agent': 'Mozilla/5.0',
      },
      body: new URLSearchParams({
        client_id: combo.id,
        username,
        password: env.TRANSPHARM_PASSWORD,
      }),
      redirect: 'manual',
    });
    storeCookies(loginRes);

    if (loginRes.ok) {
      const authRes = await fetch(authorizeUrl, {
        redirect: 'manual',
        headers: { Cookie: cookieHeader(), 'User-Agent': 'Mozilla/5.0' },
      });
      storeCookies(authRes);

      const location = authRes.headers.get('location') || '';
      const codeMatch = location.match(/[?&]code=([^&]+)/);
      if (codeMatch) {
        const tokenResult = await requestToken(
          `${base}${TOKEN_PATH}`,
          {
            grant_type: 'authorization_code',
            client_id: combo.id,
            code: codeMatch[1],
            redirect_uri: redirectUri,
            code_verifier: verifier,
          },
          { ...combo, useBasicAuth: !!combo.secret }
        );
        if (tokenResult.ok) {
          return { ...tokenResult, username, method: 'pkce' };
        }
      }
    }
  }

  return null;
}

export async function getTranspharmToken(env) {
  const base = env.TRANSPHARM_BASE_URL.replace(/\/$/, '');

  const combos = env.TRANSPHARM_CLIENT_ID
    ? [{ id: env.TRANSPHARM_CLIENT_ID, secret: env.TRANSPHARM_CLIENT_SECRET || 'secret' }]
    : CLIENT_COMBOS;

  let lastError = '';

  for (const combo of combos) {
    for (const username of usernameVariants(env.TRANSPHARM_USER)) {
      const result = await tryPasswordGrant(base, env, combo, username);
      if (result.ok) {
        return { token: result.token, base, clientId: combo.id, username, method: 'password' };
      }
      lastError = `[password/${combo.id}] ${username}: ${result.status} ${result.text}`;
    }

    const cc = await tryClientCredentials(base, combo);
    if (cc.ok) {
      return { token: cc.token, base, clientId: combo.id, method: 'client_credentials' };
    }

    const pkce = await tryPkceLogin(base, env, combo);
    if (pkce?.ok) {
      return {
        token: pkce.token,
        base,
        clientId: combo.id,
        username: pkce.username,
        method: 'pkce',
      };
    }
  }

  throw new Error(
    `Transpharm login failed — username or password rejected by Transpharm.\n${lastError}\n\n` +
      'Check your .env credentials match exactly what you use at https://www.transpharm.co.za/login\n' +
      '• TRANSPHARM_USER is usually your B2B email or mobile number (try with/without leading 0)\n' +
      '• Confirm you can log in manually on the Transpharm website first\n\n' +
      'If you have a price list CSV from Transpharm, we can import that instead.'
  );
}
