import { loadEnv } from './load-env.mjs';

const env = loadEnv();
const base = env.TRANSPHARM_BASE_URL.replace(/\/$/, '');

const tokenUrls = [
  `${base}/authorizationserver/oauth/token`,
  `${base}/oauth/token`,
];

const clientIds = [
  env.TRANSPHARM_CLIENT_ID,
  'spartacus_client_transpharm',
  'spartacus_client',
  'mobile_android',
  'mobile_ios',
  'trusted_client',
  'spartacus',
  'transpharm',
  'client_side',
].filter(Boolean);

for (const url of tokenUrls) {
  for (const cid of clientIds) {
    const body = new URLSearchParams({
      grant_type: 'password',
      client_id: cid,
      username: env.TRANSPHARM_USER,
      password: env.TRANSPHARM_PASSWORD,
    });
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body,
    });
    const text = await res.text();
    console.log(url, cid, res.status, text.slice(0, 180).replace(/\n/g, ' '));
  }
}
