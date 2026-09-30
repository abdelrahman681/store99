import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { LookupService } from '../../core/services/lookup.service';
import { ProductsActions } from './products.actions';

@Injectable()
export class ProductsEffects {
  private actions$ = inject(Actions);
  private productService = inject(ProductService);
  private lookupService = inject(LookupService);

  loadProducts$ = createEffect(() => this.actions$.pipe(
    ofType(ProductsActions.loadProducts),
    switchMap(({ query }) => this.productService.getProducts(query).pipe(
      map(result => ProductsActions.loadProductsSuccess({ result })),
      catchError((err: HttpErrorResponse) => of(ProductsActions.loadProductsFailure({
        error: err.message ?? 'تعذر تحميل المنتجات'
      })))
    ))
  ));

  loadProduct$ = createEffect(() => this.actions$.pipe(
    ofType(ProductsActions.loadProduct),
    switchMap(({ id }) => this.productService.getProductById(id).pipe(
      map(product => ProductsActions.loadProductSuccess({ product })),
      catchError((err: HttpErrorResponse) => of(ProductsActions.loadProductFailure({
        error: err.message ?? 'تعذر تحميل تفاصيل المنتج'
      })))
    ))
  ));

  loadLookups$ = createEffect(() => this.actions$.pipe(
    ofType(ProductsActions.loadLookups),
    switchMap(() => forkJoin({
      brands: this.lookupService.getBrands(),
      categories: this.lookupService.getCategories(),
    }).pipe(
      map(({ brands, categories }) => ProductsActions.loadLookupsSuccess({
        brands: brands.data, categories: categories.data
      }))
    ))
  ));
}
