import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { Pagination } from '../models/pagination.model';

import {
  OrderPayload,
  OrderToReturn,
  UpdateOrderPayload
} from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private http = inject(HttpClient);

  private baseUrl =
    `${environment.apiUrl}/Order`;


  createOrder(
    payload: OrderPayload
  ): Observable<OrderToReturn> {

    return this.http.post<OrderToReturn>(
      `${this.baseUrl}/CreateOrder`,
      payload
    );

  }


  getOrdersForUser(
    pageIndex = 1,
    pageSize = 10
  ): Observable<Pagination<OrderToReturn>> {

    const params =
      new HttpParams()
        .set('PageIndex', pageIndex)
        .set('PageSize', pageSize);

    return this.http.get<Pagination<OrderToReturn>>(
      `${this.baseUrl}/GetOrdersForSpecificUser`,
      { params }
    );

  }


  getOrders(
    pageIndex = 1,
    pageSize = 10
  ): Observable<Pagination<OrderToReturn>> {

    const params =
      new HttpParams()
        .set('PageIndex', pageIndex)
        .set('PageSize', pageSize);

    return this.http.get<Pagination<OrderToReturn>>(
      `${this.baseUrl}/GetOrders`,
      { params }
    );

  }


  getOrderById(
    orderId: number
  ): Observable<OrderToReturn> {

    return this.http.get<OrderToReturn>(
      `${this.baseUrl}/GetOrderByIdForSpecificUser/${orderId}`
    );

  }


  cancelOrder(
    orderId: number
  ): Observable<string> {

    return this.http.post(
      `${this.baseUrl}/CancelOrder/${orderId}`,
      {},
      {
        responseType: 'text'
      }
    );

  }


  updateOrder(
    orderId: number,
    payload: UpdateOrderPayload
  ): Observable<OrderToReturn> {

    return this.http.put<OrderToReturn>(
      `${this.baseUrl}/${orderId}`,
      payload
    );

  }
getOrderById02(
  orderId: number
): Observable<OrderToReturn> {

  const params = new HttpParams()
    .set('Id', orderId);

  return this.http.get<OrderToReturn>(
    `${this.baseUrl}/GetOrderById`,
    { params }
  );

}


}