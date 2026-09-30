import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  WishlistData,
  WishlistPagination
} from '../../core/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  private readonly baseUrl = `${environment.apiUrl}/WishList`;

  constructor(private http: HttpClient) {}

getAllWishlist(
  pageIndex: number = 1,
  pageSize: number = 6
): Observable<WishlistPagination> {

  const params = new HttpParams()
    .set('PageIndex', pageIndex)
    .set('PageSize', pageSize);

  return this.http.get<WishlistPagination>(
    `${this.baseUrl}/GetAllWishList`,
    { params }
  );
}

  addProductToWishlist(productId: number): Observable<string> {

    return this.http.post(
      `${this.baseUrl}/AddProductToWishList/${productId}`,
      {},
      {
        responseType: 'text'
      }
    );
  }

  removeProductFromWishlist(productId: number): Observable<string> {

    return this.http.delete(
      `${this.baseUrl}/RemoveProductFromWishList/${productId}`,
      {
        responseType: 'text'
      }
    );
  }
}