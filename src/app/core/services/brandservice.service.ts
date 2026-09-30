import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pagination } from '../models/pagination.model';
import { Brand } from '../models/brand.model';

@Injectable({
  providedIn: 'root'
})
export class BrandService {

  private http = inject(HttpClient);

  private baseUrl = `${environment.apiUrl}/Brand`;

  getBrands(): Observable<Pagination<Brand>> {

    const params = new HttpParams()
      .set('PageIndex', 1)
      .set('PageSize', 100);

    return this.http.get<Pagination<Brand>>(
      `${this.baseUrl}/GetAllBrand`,
      { params }
    );
  }
}