import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AddressDTO } from '../../core/models/address.model';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  private readonly baseUrl = `${environment.apiUrl}/Address`;

  constructor(private http: HttpClient) {}

  addAddress(dto: AddressDTO): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/AddNewAddress`,
      dto,
      { responseType: 'text' }
    );
  }

  updateAddress(dto: AddressDTO): Observable<string> {
    return this.http.put(
      `${this.baseUrl}/UpdateAddress`,
      dto,
      { responseType: 'text' }
    );
  }

  deleteAddress(addressId: number): Observable<string> {
    return this.http.delete(
      `${this.baseUrl}/DeleteAddress/${addressId}`,
      { responseType: 'text' }
    );
  }

  getAddress(addressId: number): Observable<AddressDTO> {
    return this.http.get<AddressDTO>(
      `${this.baseUrl}/GetAddress/${addressId}`
    );
  }

  getAllAddress(): Observable<AddressDTO[]> {
    return this.http.get<AddressDTO[]>(
      `${this.baseUrl}/GetAllAddress`
    );
  }
}