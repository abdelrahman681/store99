import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, concatMap, expand, first, from, map, of, switchMap, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pagination } from '../models/pagination.model';
import { Product, ProductQueryParams } from '../models/product.model';
import { legacyProductId, productSlug } from '../utils/product-slug';
import { ProductSlugService } from './product-slug.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private http = inject(HttpClient);
  private slugs = inject(ProductSlugService);

  private baseUrl = `${environment.apiUrl}/Product`;


  // =========================
  // Get All Products
  // =========================

  getProducts(
    query: ProductQueryParams
  ): Observable<Pagination<Product>> {

    let params = new HttpParams();

    if (query.sort) {
      params = params.set(
        'sort',
        query.sort
      );
    }

    if (query.productBrandId) {
      params = params.set(
        'ProductBrandId',
        query.productBrandId
      );
    }

    if (query.productCategoryId) {
      params = params.set(
        'ProductCategoryId',
        query.productCategoryId
      );
    }

    params = params.set(
      'PageIndex',
      query.pageIndex ?? 1
    );

    params = params.set(
      'PageSize',
      query.pageSize ?? 10
    );

    if (query.searchValue) {
      params = params.set(
        'SearchValue',
        query.searchValue
      );
    }

    return this.http.get<Pagination<Product>>(
      `${this.baseUrl}/GetAllProduct`,
      { params }
    ).pipe(
      tap(res => (res?.data ?? []).forEach(p => this.slugs.remember(p.id, p.name)))
    );
  }


  // =========================
  // Get Product By Id
  // =========================

  getProductById(
    id: number
  ): Observable<Product> {

    return this.http.get<Product>(
      `${this.baseUrl}/GetProductById/${id}`
    );
  }


  // =========================
  // Get Product By name-slug  (/products/ice-cream-friday)
  // =========================
  /**
   * The API only knows ids, so the slug is resolved in this order:
   *  1. the slug → id cache (filled by every product link the app has shown)
   *  2. an old "5" / "5-name" link → by id
   *  3. a search by the words of the slug, keeping the product whose slug matches exactly
   */
  getProductBySlug(slug: string): Observable<Product> {
    const matches = (p: Product) => productSlug(p.id, p.name) === slug;

    const cachedId = this.slugs.idFor(slug);
    if (cachedId !== undefined) {
      return this.getProductById(cachedId).pipe(
        switchMap(p => (matches(p) ? of(p) : this.searchBySlug(slug))),   // renamed since it was cached
        catchError(() => this.searchBySlug(slug))
      );
    }

    if (/^\d+$/.test(slug)) return this.getProductById(Number(slug));

    // "5-ice-cream-friday": a link made before ids were removed
    const legacyId = /^\d+-/.test(slug) ? legacyProductId(slug) : null;
    if (legacyId !== null) {
      const rest = slug.replace(/^\d+-/, '');
      return this.getProductById(legacyId).pipe(
        switchMap(p => (productSlug(p.id, p.name) === rest ? of(p) : this.searchBySlug(slug))),
        catchError(() => this.searchBySlug(slug))
      );
    }

    return this.searchBySlug(slug);
  }

  private searchBySlug(slug: string): Observable<Product> {
    const words = slug.split('-').filter(Boolean);
    // full phrase first, then shorter beginnings (names with punctuation don't match the full phrase)
    const queries = [...new Set([words.join(' '), words.slice(0, 3).join(' '), words.slice(0, 2).join(' '), words[0]])]
      .filter(q => !!q && q.length >= 2);

    return from(queries).pipe(
      concatMap(q => this.findInSearch(q, slug)),
      first((p): p is Product => !!p, null),
      map(p => p),
      switchMap(p => (p ? of(p) : throwError(() => new Error('product not found'))))
    );
  }

  /** looks through the first pages of one search for the product whose slug matches exactly */
  private findInSearch(search: string, slug: string): Observable<Product | null> {
    const matches = (p: Product) => productSlug(p.id, p.name) === slug;
    const fetchPage = (page: number) => this.getProducts({ pageIndex: page, pageSize: 10, searchValue: search });

    return fetchPage(1).pipe(
      expand((res, index) => {
        const data = res?.data ?? [];
        const lastPage = Math.min(res?.totalPages || 1, 5);
        return data.length === 0 || data.some(matches) || index + 1 >= lastPage ? EMPTY : fetchPage(index + 2);
      }),
      map(res => (res?.data ?? []).find(matches) ?? null),
      first((p): p is Product => !!p, null)
    );
  }

  // =========================
  // Create Product
  // =========================

  createProduct(product: {
    name: string;
    description: string;
    price: number;
      oldPrice: number;
    productBrandId: number;
    productCategoryId: number;
    stockQuantity: number;
    image: File;
  }): Observable<string> {

    const formData = new FormData();

    formData.append(
      'Name',
      product.name
    );

    formData.append(
      'Description',
      product.description
    );

    formData.append(
      'Price',
      product.price.toString()
    );
    formData.append(
      'OldPrice',
      product.oldPrice.toString()
    );
    formData.append(
      'ProductBrandId',
      product.productBrandId.toString()
    );

    formData.append(
      'ProductCategoryId',
      product.productCategoryId.toString()
    );

    formData.append(
      'StockQuantity',
      product.stockQuantity.toString()
    );

    formData.append(
      'Image',
      product.image
    );

    return this.http.post(
      `${this.baseUrl}/CreateProduct`,
      formData,
      {
        responseType: 'text'
      }
    );
  }


  // =========================
  // Edit Product
  // =========================

  editProduct(product: {
    id: number;
    name: string;
    description: string;
    price: number;
      oldPrice: number;
    productBrandId: number;
    productCategoryId: number;
    stockQuantity: number;
    pictureUrl: string;
    image?: File | null;
  }): Observable<string> {

    const formData = new FormData();

    formData.append(
      'Id',
      product.id.toString()
    );

    formData.append(
      'Name',
      product.name
    );

    formData.append(
      'Description',
      product.description
    );

    formData.append(
      'ProductBrandId',
      product.productBrandId.toString()
    );

    formData.append(
      'ProductCategoryId',
      product.productCategoryId.toString()
    );

    formData.append(
      'Price',
      product.price.toString()
    );
    formData.append(
      'OldPrice',
      product.oldPrice.toString()
    );
    formData.append(
      'StockQuantity',
      product.stockQuantity.toString()
    );

    formData.append(
      'PictureUrl',
      product.pictureUrl
    );

    // الصورة اختيارية في التعديل
    if (product.image) {
      formData.append(
        'Image',
        product.image
      );
    }

    return this.http.put(
      `${this.baseUrl}/EditProduct`,
      formData,
      {
        responseType: 'text'
      }
    );
  }


  // =========================
  // Delete Product
  // =========================

  deleteProduct(
    productId: number
  ): Observable<string> {

    return this.http.delete(
      `${this.baseUrl}/DeleteProduct`,
      {
        params: {
          productId: productId.toString()
        },
        responseType: 'text'
      }
    );
  }

}