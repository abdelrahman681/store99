import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CustomerBasket } from '../models/basket.model';

@Injectable({ providedIn: 'root' })
export class BasketService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/Basket`;

  getBasket(): Observable<CustomerBasket> {
    return this.http.get<CustomerBasket>(
      `${this.baseUrl}/GetBasket`
    );
  }

  updateBasket(basket: CustomerBasket): Observable<CustomerBasket> {
    return this.http.post<CustomerBasket>(
      `${this.baseUrl}/UpdateBasket`,
      basket
    );
  }

  getDeliveryMethods(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/GetDeliveryMethodName`
    );
  }
}