/**
 * Product URLs are the name only:  /products/ice-cream-friday   (Arabic names work too).
 * If a name has no letters/digits at all, the id is used instead (/products/12).
 */
export function productSlug(id: number, name?: string | null): string {
  const text = (name ?? '')
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')   // Arabic diacritics + tatweel
    .replace(/[^\p{L}\p{N}]+/gu, '-')                // everything that isn't a letter/number -> "-"
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');

  return text || String(id);
}

/** Old links: "5" or "5-ice-cream-friday" (id first) → 5 */
export function legacyProductId(param: string | null | undefined): number | null {
  const match = /^(\d+)(?:-.*)?$/.exec(param ?? '');
  return match ? Number(match[1]) : null;
}
