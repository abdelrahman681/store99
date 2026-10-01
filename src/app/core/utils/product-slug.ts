/**
 * Product URLs look like  /products/10-iphone-15-pro  (or /products/10-سماعة-بلوتوث).
 * The number in front is the real product id, so no API change is needed and old links
 * such as /products/10 keep working.
 */
export function productSlug(id: number, name?: string | null): string {
  const text = (name ?? '')
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')   // Arabic diacritics + tatweel
    .replace(/[^\p{L}\p{N}]+/gu, '-')                // everything that isn't a letter/number -> "-"
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');

  return text ? `${id}-${text}` : String(id);
}

/** "10-iphone-15" -> 10   |   "10" -> 10   |   "abc" -> null */
export function productIdFromParam(param: string | null | undefined): number | null {
  const match = /^(\d+)/.exec(param ?? '');
  return match ? Number(match[1]) : null;
}
