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

  /**
   * Basket ids:
   *  - logged-in user  -> a stable id built from the account email, so the same account always gets
   *                       the same basket back after logging out and in again (on any browser);
   *  - guest           -> a random id kept in localStorage.
   */
  private userBasketId(email?: string | null): string | null {
    const e = email?.trim().toLowerCase();
    return e ? `user_${e}` : null;
  }

  private savedUserEmail(): string | null {
    try {
      if (!localStorage.getItem('talabat_token')) return null;
      const raw = localStorage.getItem('talabat_user');
      return raw ? (JSON.parse(raw)?.email ?? null) : null;
    } catch {
      return null;
    }
  }

  /** Called right after login/register: switch to this account's basket. */
  useUserBasket(email: string): string {
    const id = this.userBasketId(email)!;
    localStorage.setItem(BASKET_ID_KEY, id);
    return id;
  }

  getOrCreateBasketId(): string {
    const userId = this.userBasketId(this.savedUserEmail());
    if (userId) {
      localStorage.setItem(BASKET_ID_KEY, userId);
      return userId;
    }

    let id = localStorage.getItem(BASKET_ID_KEY);
    // a leftover "user_..." id must never be used by a logged-out visitor
    if (!id || id.startsWith('user_')) {
      id = crypto.randomUUID();
      localStorage.setItem(BASKET_ID_KEY, id);
    }
    return id;
  }

  clearBasketId(): void {
    localStorage.removeItem(BASKET_ID_KEY);
  }

  getBasket(basketId: string): Observable<CustomerBasket> {
    return this.http.get<CustomerBasket>(`${this.baseUrl}/GetBasket/${encodeURIComponent(basketId)}`);
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
