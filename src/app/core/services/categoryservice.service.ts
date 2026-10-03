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

  // getCategories(): Observable<Pagination<Category>> {

  //   const params = new HttpParams()
  //     .set('PageIndex', 1)
  //     .set('PageSize', 100);

  //   return this.http.get<Pagination<Category>>(
  //     `${this.baseUrl}/GetAllCategory`,
  //     { params }
  //   );
  // }

    getCategories(pageIndex = 1, pageSize = 100): Observable<Pagination<Category>> {
    const params = new HttpParams()
      .set('PageIndex', pageIndex)
      .set('PageSize', pageSize);

    return this.http.get<Pagination<Category>>(
      `${this.baseUrl}/GetAllCategory`,
      { params }
    );
  }

   addCategory(name: string): Observable<string> {
    return this.http.post(`${this.baseUrl}/AddCategory`, { name }, { responseType: 'text' });
  }

  // EditBrand بيقرأ الـ id من الـ body (AddOrUpdateBrandDTO.Id)، فبنبعته في الاتنين
  // الراوت: PUT api/Brand/EditBrand — الـ id بيتبعت في الـ body (AddOrUpdateBrandDTO.Id)
  editCategory(id: number, name: string): Observable<string> {
    return this.http.put(`${this.baseUrl}/EditCategory`, { id, name }, { responseType: 'text' });
  }

  deleteCategory(id: number): Observable<string> {
    return this.http.post(`${this.baseUrl}/DeleteCategory/${id}`, {}, { responseType: 'text' });
  }
}