import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { NotificationPagination } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private http = inject(HttpClient);

  private baseUrl =
    `${environment.apiUrl}/Notification`;

  getMyNotifications(
    pageIndex: number = 1,
    pageSize: number = 5
  ): Observable<NotificationPagination> {

    const params = new HttpParams()
      .set('PageIndex', pageIndex)
      .set('PageSize', pageSize);

    return this.http.get<NotificationPagination>(
      `${this.baseUrl}/GetNotificationsForSpecificUser`,
      { params }
    );
  }
}