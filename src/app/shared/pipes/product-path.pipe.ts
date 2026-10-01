import { Pipe, PipeTransform } from '@angular/core';
import { productSlug } from '../../core/utils/product-slug';

/** Usage:  [routerLink]="p.id | productPath: p.name"  ->  ['/products', '10-iphone-15'] */
@Pipe({ name: 'productPath', standalone: true })
export class ProductPathPipe implements PipeTransform {
  transform(id: number, name?: string | null): string[] {
    return ['/products', productSlug(id, name)];
  }
}
