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

  getBrands(pageIndex = 1, pageSize = 100): Observable<Pagination<Brand>> {
    const params = new HttpParams()
      .set('PageIndex', pageIndex)
      .set('PageSize', pageSize);

    return this.http.get<Pagination<Brand>>(
      `${this.baseUrl}/GetAllBrand`,
      { params }
    );
  }
    // الـ endpoints الثلاثة بترد بنص عادي ("Brand Added"...) مش JSON، عشان كده responseType: 'text'
  addBrand(name: string): Observable<string> {
    return this.http.post(`${this.baseUrl}/AddBrand`, { name }, { responseType: 'text' });
  }

  // EditBrand بيقرأ الـ id من الـ body (AddOrUpdateBrandDTO.Id)، فبنبعته في الاتنين
  // الراوت: PUT api/Brand/EditBrand — الـ id بيتبعت في الـ body (AddOrUpdateBrandDTO.Id)
  editBrand(id: number, name: string): Observable<string> {
    return this.http.put(`${this.baseUrl}/EditBrand`, { id, name }, { responseType: 'text' });
  }

  deleteBrand(id: number): Observable<string> {
    return this.http.post(`${this.baseUrl}/DeleteBrand/${id}`, {}, { responseType: 'text' });
  }
}