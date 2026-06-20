const base = 'https://www.transpharm.co.za';
const paths = [
  '/assets/config/config.json',
  '/assets/config/config-prod.json',
  '/assets/app-config.json',
  '/occ/v2/transpharm/config',
];

for (const p of paths) {
  const r = await fetch(base + p);
  const t = await r.text();
  console.log(p, r.status, t.slice(0, 200).replace(/\n/g, ' '));
}

// grep main chunk for clientId patterns
const chunks = ['main-UPLGIACM.js', 'chunk-R52JD7HX.js'];
for (const c of chunks) {
  const js = await fetch(base + '/' + c).then((r) => r.text());
  const ids = [...js.matchAll(/clientId:"([^"]+)"/g)].map((m) => m[1]);
  const ids2 = [...js.matchAll(/client_id:"([^"]+)"/g)].map((m) => m[1]);
  console.log(c, 'clientIds:', [...new Set([...ids, ...ids2])].slice(0, 15));

  for (const needle of ['sendOtp', 'sendotp', '/otp', 'validateOtp', 'requestOtp', 'oneTimePassword', 'loginbymobile', 'dsl/brands', 'commerceVerify', 'generateOtp', 'otp/generate']) {
    const matches = [...js.matchAll(new RegExp(`.{0,30}${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.{0,80}`, 'gi'))].slice(0, 5);
    if (matches.length) {
      console.log(c, needle + ':', matches.map((m) => m[0].replace(/\s+/g, ' ')));
    }
  }

  const apiUrls = [...js.matchAll(/https?:\\\/\\\/[^"']+/g)].map((m) => m[0]).slice(0, 20);
  if (apiUrls.length) console.log(c, 'urls sample:', apiUrls.slice(0, 5));
}
