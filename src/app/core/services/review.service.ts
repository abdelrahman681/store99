import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AddReviewPayload, Review, ReviewsPage, UpdateReviewPayload } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/Review`;

  getReviews(productId: number, pageIndex = 1, pageSize = 5): Observable<ReviewsPage> {
    const params = new HttpParams()
      .set('ProductId', productId)
      .set('PageIndex', pageIndex)
      .set('PageSize', pageSize)
      // GetReviewForProduct is cached on the server for 30s ([Cache(30)]); a changing query value
      // makes sure the list shows a review right after it was added / edited / deleted.
      .set('_t', Date.now());
    return this.http.get<ReviewsPage>(`${this.baseUrl}/GetReviewForProduct`, { params });
  }

  addReview(payload: AddReviewPayload): Observable<Review> {
    return this.http.post<Review>(`${this.baseUrl}/AddReview`, payload);
  }

  // these two answer with plain text, not JSON
  updateReview(payload: UpdateReviewPayload): Observable<string> {
    return this.http.put(`${this.baseUrl}/UpdateReview`, payload, { responseType: 'text' });
  }

  deleteReview(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/DeleteReview/${id}`, { responseType: 'text' });
  }
}
