import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pagination } from '../models/pagination.model';
import { Product, ProductQueryParams } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private http = inject(HttpClient);

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
  // Create Product
  // =========================

  createProduct(product: {
    name: string;
    description: string;
    price: number;
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