import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IdentityRoleDTO } from '../models/role.model';

/** All role endpoints are Admin-only. Create / Edit / Delete answer with plain text. */
@Injectable({ providedIn: 'root' })
export class RoleService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/Role`;

  getAll(): Observable<IdentityRoleDTO[]> {
    return this.http.get<IdentityRoleDTO[]>(`${this.baseUrl}/GetAllRole`);
  }

  create(name: string): Observable<string> {
    return this.http.post(`${this.baseUrl}/CreateRole`, { name }, { responseType: 'text' });
  }

  edit(id: string, name: string): Observable<string> {
    return this.http.post(`${this.baseUrl}/EditRole`, { id, name }, { responseType: 'text' });
  }

  // DeleteRole(string Id) is a POST with a simple-type parameter → it is read from the query string
  delete(id: string): Observable<string> {
    return this.http.post(`${this.baseUrl}/DeleteRole`, {}, { params: new HttpParams().set('Id', id), responseType: 'text' });
  }
}
