/**
 * Upgrade product images to highest resolution from Transpharm.
 * Run: node scripts/upgrade-images.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pickBestImage, isLowQualityImage } from '../src/data/images.js';

const BASE = 'https://www.transpharm.co.za/occ/v2/transpharm';
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchImages(code) {
  await delay(180);
  const res = await fetch(`${BASE}/products/${encodeURIComponent(code)}?fields=images(FULL)`, {
    headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return pickBestImage(data.images);
}

function parseProductsFile(path) {
  const source = readFileSync(path, 'utf8');
  const categories = JSON.parse(source.match(/export const categories = (\[[\s\S]*?\]);/)[1]);
  const products = JSON.parse(source.match(/export const products = (\[[\s\S]*?\]);/)[1]);
  return { source, categories, products };
}

async function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const productsPath = join(root, 'src', 'data', 'products.js');
  const catalogPath = join(root, 'src', 'data', 'transpharm-catalog.json');

  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
  const codeById = new Map(catalog.products.map((p) => [p.id, p.transpharmCode]));

  const { categories, products } = parseProductsFile(productsPath);
  let upgraded = 0;
  let skipped = 0;

  console.log(`Upgrading images for ${products.length} products...\n`);

  for (const product of products) {
    const code = codeById.get(product.id);
    if (!code) {
      skipped++;
      continue;
    }

    if (!isLowQualityImage(product.image)) {
      skipped++;
      continue;
    }

    try {
      const url = await fetchImages(code);
      if (url && url !== product.image) {
        product.image = url;
        upgraded++;
        if (upgraded <= 5 || upgraded % 25 === 0) {
          console.log(`  ✓ [${product.id}] ${product.name.slice(0, 50)}…`);
        }
      }
    } catch (e) {
      console.warn(`  ✗ ${code}: ${e.message}`);
    }
  }

  const content = `// Auto-generated from Transpharm catalog — ${new Date().toISOString().slice(0, 10)}
// Source: https://www.transpharm.co.za/surgical & /veterinary
// Images: 515x515 (zoom) where available from Transpharm
// Re-run: npm run scrape-catalog | npm run upgrade-images

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

  // Sync catalog JSON too
  catalog.products.forEach((p) => {
    const updated = products.find((x) => x.id === p.id);
    if (updated) p.image = updated.image;
  });
  writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));

  console.log(`\nDone: ${upgraded} upgraded, ${skipped} unchanged`);
}

main().catch(console.error);
