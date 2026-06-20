/**
 * Scrapes public Transpharm OCC API for surgical & veterinary catalog data.
 * Run: node scripts/scrape-transpharm.mjs
 */
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { resolveProductImage } from '../src/data/images.js';

const BASE = 'https://www.transpharm.co.za/occ/v2/transpharm';
const PRODUCTS_PER_CATEGORY = 8;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(path) {
  await delay(250);
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' },
  });
  const text = await res.text();
  if (!text.startsWith('{')) throw new Error(`${res.status} ${path}: ${text.slice(0, 100)}`);
  return JSON.parse(text);
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

async function fetchProducts(categoryId, pageSize = PRODUCTS_PER_CATEGORY) {
  const q = encodeURIComponent(`:relevance:allCategories:${categoryId}`);
  const data = await api(
    `/products/search?query=${q}&pageSize=${pageSize}&currentPage=0&fields=products(code,name,summary,price(FULL),images(FULL),categories(name)),pagination`
  );
  return data.products || [];
}

function mapToSiteProduct(p, shopCategory, index) {
  const features = (p.categories || []).map((c) => c.name).filter(Boolean).slice(0, 4);
  const apiPrice = p.price?.value > 0 ? Math.round(p.price.value * 100) / 100 : null;

  return {
    id: index + 1,
    transpharmCode: p.code,
    name: p.name,
    category: shopCategory.id,
    categoryLabel: shopCategory.name,
    department: shopCategory.department,
    ...(apiPrice ? { price: apiPrice, priceOnRequest: false } : { priceOnRequest: true }),
    rating: 4.5,
    reviews: Math.floor(Math.random() * 200) + 20,
    inStock: true,
    description: p.summary || `${p.name} — supplied by EJ Surgical Solutions.`,
    features,
    image: resolveProductImage(p.images),
  };
}

function buildShopCategories(surgicalRoot) {
  const usedIds = new Set();
  const categories = [];

  for (const sub of surgicalRoot.subcategories || []) {
    let id = slugify(sub.name);
    if (usedIds.has(id)) id = `${id}-${sub.id.replace(/-/g, '').slice(-3)}`;
    usedIds.add(id);
    categories.push({
      id,
      name: sub.name,
      transpharmId: sub.id,
      department: 'Surgical',
    });
  }

  categories.push(
    { id: 'veterinary', name: 'Veterinary', transpharmId: '050', department: 'Veterinary' },
    { id: 'veterinary-articles', name: 'Veterinary Articles', transpharmId: '013', department: 'Veterinary' }
  );

  return categories;
}

async function main() {
  console.log('Loading Transpharm surgical catalog...');
  const surgicalRoot = await api('/catalogs/transpharmProductCatalog/Online/categories/012?fields=FULL');
  const shopCategories = buildShopCategories(surgicalRoot);

  console.log(`Shop categories: ${shopCategories.length}`);
  console.log('Fetching products per category...\n');

  const seen = new Set();
  const rawProducts = [];

  for (const shopCat of shopCategories) {
    try {
      const prods = await fetchProducts(shopCat.transpharmId);
      let added = 0;

      for (const p of prods) {
        if (seen.has(p.code)) continue;
        seen.add(p.code);
        rawProducts.push({ ...p, _shopCategory: shopCat });
        added++;
      }

      const status = prods.length ? `${added} products` : 'no products (skipped)';
      console.log(`  ✓ ${shopCat.name}: ${status}`);
    } catch (e) {
      console.warn(`  ✗ ${shopCat.name}: ${e.message}`);
    }
  }

  console.log(`\nTotal unique products: ${rawProducts.length}`);

  const siteProducts = rawProducts.map((p, i) => mapToSiteProduct(p, p._shopCategory, i));

  const categoryCounts = {};
  for (const p of siteProducts) {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  }
  console.log('\nProducts per category:');
  for (const cat of shopCategories) {
    console.log(`  ${cat.name}: ${categoryCounts[cat.id] || 0}`);
  }

  const sparse = shopCategories.filter((c) => {
    const count = siteProducts.filter((p) => p.category === c.id).length;
    return count < 6;
  });

  if (sparse.length) {
    console.log(`\nFilling ${sparse.length} sparse categories from subcategories...`);
    for (const cat of sparse) {
      const before = siteProducts.filter((p) => p.category === cat.id).length;
      const added = await fillSparseCategory(cat, seen, siteProducts);
      if (added) console.log(`  ↳ ${cat.name}: +${added} (now ${before + added})`);
      else if (!before) console.log(`  ↳ ${cat.name}: no public products on Transpharm`);
    }
  }

  // Merge duplicate Wound Care branch into primary wound-care category
  const woundAlt = shopCategories.find((c) => c.id.startsWith('wound-care-') && c.id !== 'wound-care');
  if (woundAlt) {
    siteProducts.forEach((p) => {
      if (p.category === woundAlt.id) p.category = 'wound-care';
    });
    const idx = shopCategories.findIndex((c) => c.id === woundAlt.id);
    if (idx !== -1) shopCategories.splice(idx, 1);
    console.log('\nMerged duplicate Wound Care category into wound-care');
  }

  siteProducts.forEach((p, i) => {
    p.id = i + 1;
  });

  const outPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'transpharm-catalog.json');
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        scrapedAt: new Date().toISOString(),
        source: 'https://www.transpharm.co.za',
        categories: shopCategories,
        products: siteProducts,
      },
      null,
      2
    )
  );

  generateProductsFile(siteProducts, shopCategories, outPath);
  console.log(`\nDone — ${siteProducts.length} products across ${shopCategories.length} categories`);
}

function flattenLeaves(node, list = []) {
  if (!node.subcategories?.length) {
    if (node.id) list.push(node);
    return list;
  }
  for (const sub of node.subcategories) flattenLeaves(sub, list);
  return list;
}

async function fillSparseCategory(shopCat, seen, siteProducts, target = 8) {
  const current = siteProducts.filter((p) => p.category === shopCat.id).length;
  if (current >= target) return 0;

  const detail = await api(
    `/catalogs/transpharmProductCatalog/Online/categories/${shopCat.transpharmId}?fields=FULL`
  );
  const leaves = flattenLeaves(detail);
  let added = 0;

  for (const leaf of leaves) {
    if (siteProducts.filter((p) => p.category === shopCat.id).length >= target) break;
    try {
      const prods = await fetchProducts(leaf.id, target);
      for (const p of prods) {
        if (seen.has(p.code)) continue;
        if (siteProducts.filter((x) => x.category === shopCat.id).length >= target) break;
        seen.add(p.code);
        siteProducts.push(mapToSiteProduct(p, shopCat, siteProducts.length));
        added++;
      }
    } catch {
      /* continue */
    }
  }
  return added;
}

const CATEGORY_ICONS = {
  'iv-access-needles-syringes': 'Syringe',
  bandaging: 'Bandage',
  'pop-plaster-casts-splints': 'Bandage',
  'cotton-and-gauze': 'Layers',
  'wound-care': 'HeartPulse',
  gloves: 'Hand',
  'blades-sutures-staplers': 'Scissors',
  respiratory: 'Activity',
  'non-chargeables': 'Package',
  'ppe-donning': 'Shield',
  'cleaning-antiseptic-and-waste': 'Shield',
  urology: 'Package',
  'surgical-general-miscellaneous': 'Package',
  'ostomy-care': 'Package',
  physiotherapy: 'Accessibility',
  'furniture-trolleys': 'Package',
  'baby-paediatrics': 'Package',
  gynaecology: 'Package',
  'patient-monitoring': 'Activity',
  'tests-and-strips': 'Activity',
  laboratory: 'Package',
  dental: 'Package',
  renal: 'Package',
  'surgical-instruments': 'Scissors',
  'equipment-and-accessories': 'Package',
  'ent-ear-nose-and-throat': 'Package',
  aesthetics: 'Package',
  orthopaedic: 'Accessibility',
  veterinary: 'HeartPulse',
  'veterinary-articles': 'HeartPulse',
};

function generateProductsFile(products, shopCategories, catalogPath) {
  const iconFor = (id) => CATEGORY_ICONS[id] || 'Package';

  const categoriesExport = [
    { id: 'all', name: 'All Products', icon: 'LayoutGrid' },
    ...shopCategories.map((c) => ({ id: c.id, name: c.name, icon: iconFor(c.id), department: c.department })),
  ];

  const cleanProducts = products.map(({ transpharmCode, categoryLabel, department, ...p }) => p);

  const content = `// Auto-generated from Transpharm catalog — ${new Date().toISOString().slice(0, 10)}
// Source: https://www.transpharm.co.za/surgical & /veterinary
// Pricing: contact for quote (Transpharm B2B prices require login)
// Re-run: npm run scrape-catalog

export const categories = ${JSON.stringify(categoriesExport, null, 2)};

export const products = ${JSON.stringify(cleanProducts, null, 2)};

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

  const productsPath = join(dirname(catalogPath), 'products.js');
  writeFileSync(productsPath, content);
  console.log(`Updated ${productsPath}`);
}

main().catch(console.error);
