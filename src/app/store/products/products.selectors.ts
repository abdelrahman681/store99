import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductsState, productsFeatureKey } from './products.reducer';

export const selectProductsState = createFeatureSelector<ProductsState>(productsFeatureKey);

export const selectAllProducts = createSelector(selectProductsState, s => s.items);
export const selectSelectedProduct = createSelector(selectProductsState, s => s.selected);
export const selectBrands = createSelector(selectProductsState, s => s.brands);
export const selectCategories = createSelector(selectProductsState, s => s.categories);
export const selectProductsQuery = createSelector(selectProductsState, s => s.query);
export const selectProductsLoading = createSelector(selectProductsState, s => s.loading);
export const selectProductsPaging = createSelector(selectProductsState, s => ({
  pageIndex: s.pageIndex, pageSize: s.pageSize, totalPages: s.totalPages, totalCount: s.totalCount
}));
