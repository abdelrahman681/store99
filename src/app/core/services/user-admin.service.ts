import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminUser, UserRolePayload } from '../models/user-admin.model';

/** Admin-only endpoints of UserController. */
@Injectable({ providedIn: 'root' })
export class UserAdminService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/User`;

  /** accepts both a plain array and a { data: [...] } pagination object */
  getUsers(): Observable<AdminUser[]> {
    const params = new HttpParams().set('PageIndex', 1).set('PageSize', 1000);
    return this.http
      .get<AdminUser[] | { data: AdminUser[] }>(`${this.baseUrl}/GetAllRole`, { params })
      .pipe(map(res => (Array.isArray(res) ? res : res?.data ?? [])));
  }

  // [HttpPut] Edit(UserRoleDTO) has no route name → PUT api/User, and answers with an empty 200
  updateRoles(payload: UserRolePayload): Observable<string> {
    return this.http.put(this.baseUrl, payload, { responseType: 'text' });
  }
}
