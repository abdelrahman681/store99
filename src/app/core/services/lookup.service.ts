import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pagination } from '../models/pagination.model';
import { Brand } from '../models/brand.model';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class LookupService {
  private http = inject(HttpClient);

  getBrands(): Observable<Pagination<Brand>> {
    return this.http.get<Pagination<Brand>>(`${environment.apiUrl}/Brand/GetAllBrand`, {
      params: { PageIndex: 1, PageSize: 100 }
    });
  }

  getCategories(): Observable<Pagination<Category>> {
    return this.http.get<Pagination<Category>>(`${environment.apiUrl}/Category/GetAllCategory`, {
      params: { PageIndex: 1, PageSize: 100 }
    });
  }
}
