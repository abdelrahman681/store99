import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginDTO, RegisterPayload, UserDTO,ResetPasswordDto,ChangePasswordDTO,RefreshTokenResponse } from '../models/user.model';
const TOKEN_KEY = 'talabat_token';
const USER_KEY = 'talabat_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/Account`;
  currentUser = signal<UserDTO | null>(this.loadUser());

  private loadUser(): UserDTO | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }



  /** Reads the role out of the JWT (works for both the short "role" claim and the long Microsoft one). */
  private roleFromToken(token?: string | null): string | undefined {
    if (!token) return undefined;
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const claims = JSON.parse(decodeURIComponent(escape(atob(payload))));
      const role = claims['role'] ?? claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      return Array.isArray(role) ? role[0] : role;
    } catch {
      return undefined;
    }
  }

  /** The current-user endpoint may not return roleName, so fall back to the saved user, then to the token. */
  private withRole(user: UserDTO): UserDTO {
    if (user.roleName) return user;
    const roleName =
      this.loadUser()?.roleName ??
      this.roleFromToken(user.token) ??
      this.roleFromToken(localStorage.getItem(TOKEN_KEY));
    return roleName ? { ...user, roleName } : user;
  }

  private persist(user: UserDTO): void {
    localStorage.setItem(TOKEN_KEY, user.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

login(payload: LoginDTO): Observable<UserDTO> {
  return this.http.post<UserDTO>(
    `${this.baseUrl}/Login`,
    payload,
    { withCredentials: true }
  );
}

  register(payload: RegisterPayload): Observable<UserDTO> {
    let params = new HttpParams()
      .set('Email', payload.Email)
      .set('PhoneNumber', payload.PhoneNumber)
      .set('DisplayName', payload.DisplayName)
      .set('Password', payload.Password);
    if (payload.DOB) params = params.set('DOB', payload.DOB);
    if (payload.Gender) params = params.set('Gender', payload.Gender);

    const formData = new FormData();
    if (payload.Photo) formData.append('Photo', payload.Photo);

    return this.http.post<UserDTO>(`${this.baseUrl}/Register`, formData, { params });
  }

getCurrentUser(): Observable<UserDTO> {
  return this.http
    .get<UserDTO>(`${this.baseUrl}/GetCurrentUser`)
    .pipe(
      map(user => this.withRole(user)),
      tap(user => this.persist(user))
    );
}

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/CheckEmailExsist`, { params: { email } });
  }

refreshToken(): Observable<string> {
  return this.http.post(
    `${this.baseUrl}/refresh-token`,
    {},
    {
      withCredentials: true,
      responseType: 'text'
    }
  );
}

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {});
  }


  verifyOtp(data: {
    email: string;
    otp: string;
  }): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/verify-otp`,
      data,
      {
        responseType: 'text' as const
      }
    );
  }

  resendOtp(email: string): Observable<string> {
    const params = new HttpParams()
      .set('Email', email);

    return this.http.post(
      `${this.baseUrl}/resend-otp`,
      null,
      {
        params,
        responseType: 'text' as const
      }
    );
  }
  updateProfilePhoto(photo: File): Observable<boolean> {

    const formData = new FormData();

    formData.append('Photo', photo);

    return this.http.put<boolean>(
      `${this.baseUrl}/UpdatePhotoForUserProfile`,
      formData
    );
  }
  resetPassword(dto: ResetPasswordDto): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/reset-password`,
      dto,
      {
        responseType: 'text' as const
      }
    );
  }
  forgotPassword(email: string): Observable<string> {
    const params = new HttpParams()
      .set('Email', email);

    return this.http.post(
      `${this.baseUrl}/forgot-password`,
      null,
      {
        params,
        responseType: 'text' as const
      }
    );
  }
  deleteUser(): Observable<string> {
    return this.http.delete(`${this.baseUrl}/DeleteUser`, { responseType: 'text' });
  }

  changePassword(dto: ChangePasswordDTO): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.baseUrl}/ChangePassword`, dto)
      .pipe(map(user => this.withRole(user)), tap(user => this.persist(user)));
  }
  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }
  googleLogin(idToken: string): Observable<UserDTO> {
  return this.http.post<UserDTO>(
    `${this.baseUrl}/GoogleLogin`,
    {
      idToken: idToken
    },
    {
      withCredentials: true
    }
  );
}
}
