import { Pipe, PipeTransform, inject } from '@angular/core';
import { ProductSlugService } from '../../core/services/product-slug.service';

/** Usage:  [routerLink]="p.id | productPath: p.name"  ->  ['/products', 'ice-cream-friday'] */
@Pipe({ name: 'productPath', standalone: true })
export class ProductPathPipe implements PipeTransform {
  private slugs = inject(ProductSlugService);

  transform(id: number, name?: string | null): string[] {
    return ['/products', this.slugs.remember(id, name)];
  }
}
