/**
 * Authenticate with Transpharm B2B and sync product prices.
 * Run: npm run sync-prices
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { loadEnv } from './load-env.mjs';
import { getTranspharmToken } from './get-transpharm-token.mjs';

async function getToken(env) {
  const result = await getTranspharmToken(env);
  console.log(`Authenticated (${result.method}, client: ${result.clientId}${result.username ? `, user: ${result.username}` : ''})`);
  return { token: result.token, base: result.base };
}

async function fetchProductPrice(base, token, code) {
  const url = `${base}/occ/v2/transpharm/products/${encodeURIComponent(code)}?fields=code,name,price(FULL)`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return null;
  const data = await res.json();
  const value = data.price?.value;
  return value > 0 ? Math.round(value * 100) / 100 : null;
}

function parseProductsFile(path) {
  const source = readFileSync(path, 'utf8');
  const categories = JSON.parse(source.match(/export const categories = (\[[\s\S]*?\]);/)[1]);
  const products = JSON.parse(source.match(/export const products = (\[[\s\S]*?\]);/)[1]);
  return { categories, products };
}

async function main() {
  const env = loadEnv();
  console.log('Logging in to Transpharm B2B...\n');

  const { token, base } = await getToken(env);

  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const productsPath = join(root, 'src', 'data', 'products.js');
  const catalogPath = join(root, 'src', 'data', 'transpharm-catalog.json');

  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
  const codeById = new Map(catalog.products.map((p) => [p.id, p.transpharmCode]));
  const { categories, products } = parseProductsFile(productsPath);

  let updated = 0;
  let missing = 0;

  console.log(`Fetching prices for ${products.length} products...\n`);

  for (const product of products) {
    const code = codeById.get(product.id);
    if (!code) {
      missing++;
      continue;
    }

    await new Promise((r) => setTimeout(r, 150));

    const price = await fetchProductPrice(base, token, code);
    if (price) {
      product.price = price;
      product.priceOnRequest = false;
      updated++;
      if (updated <= 3 || updated % 30 === 0) {
        console.log(`  ✓ [${product.id}] R${price.toFixed(2)} — ${product.name.slice(0, 45)}…`);
      }
    } else {
      missing++;
    }
  }

  const content = `// Auto-generated from Transpharm catalog — ${new Date().toISOString().slice(0, 10)}
// Prices synced from Transpharm B2B — ${new Date().toISOString()}
// Re-run: npm run sync-prices

export const categories = ${JSON.stringify(categories, null, 2)};

export const products = ${JSON.stringify(products, null, 2)};

export function getProductById(id) {
  return products.find((p) => p.id === Number(id));
}

export function getProductsByCategory(categoryId) {
  if (categoryId === 'all') return products;
  return products.filter((p) => p.category === categoryId);
}

export function formatPrice(price, priceOnRequest = false) {
  if (priceOnRequest || !price) return 'Contact for price';
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(price);
}
`;

  writeFileSync(productsPath, content);

  catalog.products.forEach((p) => {
    const u = products.find((x) => x.id === p.id);
    if (u) {
      p.price = u.price;
      p.priceOnRequest = u.priceOnRequest;
    }
  });
  writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));

  console.log(`\nDone: ${updated} prices updated, ${missing} without B2B price`);
}

main().catch((err) => {
  console.error('\nError:', err.message);
  process.exit(1);
});
