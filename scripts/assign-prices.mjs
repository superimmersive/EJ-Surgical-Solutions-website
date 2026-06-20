/**
 * Apply estimated ZAR prices to products in products.js
 * Run: node scripts/assign-prices.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { applyPricing } from '../src/data/pricing.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const productsPath = join(root, 'src', 'data', 'products.js');

const source = readFileSync(productsPath, 'utf8');

const categoriesMatch = source.match(/export const categories = (\[[\s\S]*?\]);/);
const productsMatch = source.match(/export const products = (\[[\s\S]*?\]);/);

if (!categoriesMatch || !productsMatch) {
  throw new Error('Could not parse products.js');
}

const categories = JSON.parse(categoriesMatch[1]);
const products = JSON.parse(productsMatch[1]).map(applyPricing);

const output = `// Auto-generated from Transpharm catalog — ${new Date().toISOString().slice(0, 10)}
// Source: https://www.transpharm.co.za/surgical & /veterinary
// Prices: estimated ZAR retail (Transpharm B2B prices require login)
// Re-run catalog: npm run scrape-catalog | npm run assign-prices

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

writeFileSync(productsPath, output);
console.log(`Updated ${products.length} products with prices`);
console.log('Sample:', products.slice(0, 3).map((p) => `${p.name}: R${p.price}`).join('\n'));
