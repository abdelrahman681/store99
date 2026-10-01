import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pagination } from '../models/pagination.model';
import { OrderPayload, OrderToReturn, UpdateOrderPayload } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/Order`;

  createOrder(payload: OrderPayload): Observable<OrderToReturn> {
    return this.http.post<OrderToReturn>(`${this.baseUrl}/CreateOrder`, payload);
  }

  getOrdersForUser(pageIndex = 1, pageSize = 10): Observable<Pagination<OrderToReturn>> {
    const params = new HttpParams().set('PageIndex', pageIndex).set('PageSize', pageSize);
    return this.http.get<Pagination<OrderToReturn>>(`${this.baseUrl}/GetOrdersForSpecificUser`, { params });
  }

  getOrderById(orderId: number): Observable<OrderToReturn> {
    return this.http.get<OrderToReturn>(`${this.baseUrl}/GetOrderByIdForSpecificUser/${orderId}`);
  }

  // The API answers with plain text ("...Successfully"), not JSON — without responseType 'text'
  // Angular fails to parse it and reports an error even though the order WAS cancelled.
  cancelOrder(orderId: number): Observable<string> {
    return this.http.post(`${this.baseUrl}/CancelOrder/${orderId}`, {}, { responseType: 'text' });
  }

  // PUT api/Order/{orderId}  (Admin)

updateOrder(
  orderId: number,
  payload: UpdateOrderPayload
): Observable<OrderToReturn> {
  return this.http.put<OrderToReturn>(
    `${this.baseUrl}/Order/${orderId}`,
    payload
  );
}


}
