import { Injectable } from '@angular/core';
import { productSlug } from '../utils/product-slug';

const STORAGE_KEY = 'store99_product_slugs';
const MAX_ENTRIES = 600;

/**
 * Remembers which product id sits behind each name-slug, so opening /products/ice-cream-friday
 * doesn't need a search. It is filled automatically by every product link the app renders.
 */
@Injectable({ providedIn: 'root' })
export class ProductSlugService {
  private map = new Map<string, number>();
  private persistQueued = false;

  constructor() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.map = new Map<string, number>(JSON.parse(raw));
    } catch { /* storage unavailable → memory only */ }
  }

  remember(id: number, name?: string | null): string {
    const slug = productSlug(id, name);
    if (this.map.get(slug) !== id) {
      this.map.delete(slug);
      this.map.set(slug, id);                       // newest entries live at the end
      if (this.map.size > MAX_ENTRIES) this.map.delete(this.map.keys().next().value as string);
      this.persistSoon();
    }
    return slug;
  }

  idFor(slug: string): number | undefined {
    return this.map.get(slug);
  }

  private persistSoon(): void {
    if (this.persistQueued) return;
    this.persistQueued = true;
    queueMicrotask(() => {
      this.persistQueued = false;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.map])); } catch { /* ignore */ }
    });
  }
}
