/** Estimate ZAR retail prices when supplier API hides pricing (B2B login required). */

const CATEGORY_BASE = {
  'iv-access-needles-syringes': 125,
  bandaging: 55,
  'pop-plaster-casts-splints': 85,
  'cotton-and-gauze': 45,
  'wound-care': 95,
  gloves: 220,
  'blades-sutures-staplers': 180,
  respiratory: 75,
  'non-chargeables': 35,
  'ppe-donning': 65,
  'cleaning-antiseptic-and-waste': 110,
  urology: 140,
  'surgical-general-miscellaneous': 90,
  'ostomy-care': 160,
  physiotherapy: 130,
  'furniture-trolleys': 450,
  'baby-paediatrics': 70,
  gynaecology: 120,
  'patient-monitoring': 350,
  'tests-and-strips': 95,
  laboratory: 200,
  dental: 150,
  renal: 180,
  'surgical-instruments': 250,
  'equipment-and-accessories': 320,
  'ent-ear-nose-and-throat': 140,
  aesthetics: 280,
  orthopaedic: 195,
  veterinary: 85,
  'veterinary-articles': 75,
};

function hashString(str) {
  return str.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

function parsePackSize(name) {
  const patterns = [
    /(\d+)\s*'?s(?:~)?(?:\s|$)/i,
    /(\d+)\s*'?S(?:\s|$)/,
    /(\d+)\s*[- ]?pack/i,
    /(\d+)\s*[- ]?count/i,
    /(\d+)s\b/i,
    /(\d+)~\s*$/,
  ];
  for (const pattern of patterns) {
    const match = name.match(pattern);
    if (match) return Math.max(1, parseInt(match[1], 10));
  }
  if (/\b1'?s?\b|@\s*1\b|\b1~/.test(name)) return 1;
  return null;
}

function priceFromFeatures(features = [], name = '') {
  for (const feature of features) {
    const lessThan = feature.match(/Less Than R(\d+)/i);
    if (lessThan) {
      const cap = parseInt(lessThan[1], 10);
      const min = Math.max(4.99, cap * 0.35);
      const max = Math.max(min + 1, cap - 0.5);
      const spread = Math.round((max - min) * 100);
      const offset = hashString(name + feature) % (spread + 1);
      return Math.round((min + offset / 100) * 100) / 100;
    }
  }
  return null;
}

export function estimatePrice(name, category, features = []) {
  const fromFeatures = priceFromFeatures(features, name);
  if (fromFeatures != null) {
    return Math.max(5, Math.round(fromFeatures * 100) / 100);
  }

  let price = CATEGORY_BASE[category] ?? 99;
  const pack = parsePackSize(name);
  const nameLower = name.toLowerCase();

  if (pack != null) {
    if (pack === 1) price *= 0.12;
    else if (pack <= 5) price *= 0.35;
    else if (pack <= 10) price *= 0.55;
    else if (pack <= 25) price *= 0.85;
    else if (pack <= 50) price *= 1.4;
    else if (pack <= 100) price *= 2.2;
    else price *= 2.8;
  }

  if (/catheter|cannula/i.test(name)) price *= 1.15;
  if (/syringe/i.test(name)) price *= 0.85;
  if (/needle/i.test(name)) price *= 0.75;
  if (/tray|set|kit/i.test(name)) price *= 1.6;
  if (/sterile/i.test(name)) price *= 1.08;
  if (/suture|stapler|blade/i.test(name)) price *= 1.25;
  if (/glove/i.test(name)) price *= 1.1;

  const variance = (hashString(name) % 37) - 18;
  price += variance;

  price = Math.max(8.99, price);
  return Math.round(price * 100) / 100;
}

export function applyPricing(product) {
  const price = estimatePrice(product.name, product.category, product.features);

  return {
    ...product,
    price,
    priceOnRequest: false,
    description: (product.description || '').replace(/ Contact us for pricing\.?$/, ''),
  };
}
