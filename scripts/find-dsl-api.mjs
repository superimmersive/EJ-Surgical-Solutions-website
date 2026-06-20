const js = await fetch('https://www.transpharm.co.za/main-UPLGIACM.js').then((r) => r.text());
const m = js.match(/T2="([^"]+)"/);
console.log('T2', m?.[1]);
const idx = js.indexOf('createHeader(');
console.log(js.slice(idx, idx + 400));

const idx2 = js.indexOf('getDslOAuthToken');
console.log('\n--- getDslOAuthToken ---\n', js.slice(idx2, idx2 + 800));
