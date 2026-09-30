import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CustomerBasket } from '../models/basket.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/Payment`;

  /**
   * Asks the API to create (or refresh) the Stripe PaymentIntent attached to
   * this basket, and returns the basket with its clientSecret populated.
   */
  createOrUpdatePaymentIntent(basketId: string): Observable<CustomerBasket> {
    const params = new HttpParams().set('BasketId', basketId);
    return this.http.post<CustomerBasket>(`${this.baseUrl}/CreateOrUpdatePaymentIntent`, {}, { params });
  }
}
