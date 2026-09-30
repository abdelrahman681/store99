import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pagination } from '../models/pagination.model';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private http = inject(HttpClient);

  private baseUrl = `${environment.apiUrl}/Category`;

  getCategories(): Observable<Pagination<Category>> {

    const params = new HttpParams()
      .set('PageIndex', 1)
      .set('PageSize', 100);

    return this.http.get<Pagination<Category>>(
      `${this.baseUrl}/GetAllCategory`,
      { params }
    );
  }
}