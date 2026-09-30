import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CustomerBasket } from '../models/basket.model';

const BASKET_ID_KEY = 'store99_basket_id';

@Injectable({ providedIn: 'root' })
export class BasketService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/Basket`;

  getOrCreateBasketId(): string {
    let id = localStorage.getItem(BASKET_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(BASKET_ID_KEY, id);
    }
    return id;
  }

  clearBasketId(): void {
    localStorage.removeItem(BASKET_ID_KEY);
  }

  getBasket(basketId: string): Observable<CustomerBasket> {
    return this.http.get<CustomerBasket>(`${this.baseUrl}/GetBasket/${basketId}`);
  }

  updateBasket(basket: CustomerBasket): Observable<CustomerBasket> {
    return this.http.post<CustomerBasket>(`${this.baseUrl}/UpdateBasket`, basket);
  }

  deleteBasket(basketId: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/DeleteBasket`, { params: { BasketId: basketId } });
  }

  getDeliveryMethods(): Observable<any> {
    return this.http.get(`${this.baseUrl}/GetDeliveryMethodName`);
  }
}
