import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Pagination } from '../../core/models/pagination.model';
import { Product, ProductQueryParams } from '../../core/models/product.model';
import { Brand } from '../../core/models/brand.model';
import { Category } from '../../core/models/category.model';

export const ProductsActions = createActionGroup({
  source: 'Products',
  events: {
    'Load Products': props<{ query: ProductQueryParams }>(),
    'Load Products Success': props<{ result: Pagination<Product> }>(),
    'Load Products Failure': props<{ error: string }>(),

    'Load Product': props<{ id: number }>(),
    'Load Product Success': props<{ product: Product }>(),
    'Load Product Failure': props<{ error: string }>(),

    'Load Lookups': emptyProps(),
    'Load Lookups Success': props<{ brands: Brand[]; categories: Category[] }>(),

    'Set Query': props<{ query: ProductQueryParams }>(),
  }
});
