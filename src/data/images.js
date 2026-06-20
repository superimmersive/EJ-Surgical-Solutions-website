/** Pick the highest-resolution image from Transpharm product images. */
const FORMAT_PRIORITY = ['zoom', 'product', 'thumbnail', 'cartIcon'];

export function pickBestImage(images = []) {
  if (!images.length) return null;

  for (const format of FORMAT_PRIORITY) {
    const match = images.find((img) => img.format === format && img.url);
    if (match) return toAbsoluteUrl(match.url);
  }

  const fallback = images.find((img) => img.url);
  return fallback ? toAbsoluteUrl(fallback.url) : null;
}

export function toAbsoluteUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `https://www.transpharm.co.za${url}`;
}

export const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1579684385127-1ef15f558118?w=600&h=600&fit=crop';

export function resolveProductImage(images) {
  return pickBestImage(images) || PLACEHOLDER_IMAGE;
}

/** Upgrade a legacy 96x96 thumbnail URL by fetching product detail when code is known. */
export function isLowQualityImage(url) {
  return !url || /96Wx96H|65Wx65H/i.test(url);
}
