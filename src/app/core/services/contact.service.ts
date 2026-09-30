import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContactUsPayload } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/ContactUs`;

  send(payload: ContactUsPayload): Observable<string> {
    return this.http.post(`${this.baseUrl}/Contact_Us`, payload, { responseType: 'text' });
  }
}
