import { createReducer, on } from '@ngrx/store';
import { Product, ProductQueryParams } from '../../core/models/product.model';
import { Brand } from '../../core/models/brand.model';
import { Category } from '../../core/models/category.model';
import { ProductsActions } from './products.actions';

export interface ProductsState {
  items: Product[];
  selected: Product | null;
  brands: Brand[];
  categories: Category[];
  query: ProductQueryParams;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  loading: boolean;
  error: string | null;
}

export const productsFeatureKey = 'products';

export const initialState: ProductsState = {
  items: [],
  selected: null,
  brands: [],
  categories: [],
  query: { pageIndex: 1, pageSize: 8 },
  pageIndex: 1,
  pageSize: 8,
  totalPages: 0,
  totalCount: 0,
  loading: false,
  error: null,
};

export const productsReducer = createReducer(
  initialState,

  on(ProductsActions.setQuery, (state, { query }) => ({
    ...state, query: { ...state.query, ...query }
  })),

  on(ProductsActions.loadProducts, state => ({ ...state, loading: true, error: null })),

  on(ProductsActions.loadProductsSuccess, (state, { result }) => ({
    ...state,
    items: result.data,
    pageIndex: result.pageIndex,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
    totalCount: result.countOfAllItem,
    loading: false,
  })),

  on(ProductsActions.loadProductsFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(ProductsActions.loadProduct, state => ({ ...state, loading: true, selected: null })),
  on(ProductsActions.loadProductSuccess, (state, { product }) => ({ ...state, selected: product, loading: false })),
  on(ProductsActions.loadProductFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(ProductsActions.loadLookupsSuccess, (state, { brands, categories }) => ({ ...state, brands, categories })),
);
