import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../store/auth/auth.actions';

const TOKEN_KEY = 'talabat_token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const store = inject(Store);

  const token = localStorage.getItem(TOKEN_KEY);

  const isRefreshRequest = req.url.includes('/Account/refresh-token');

  let authReq = req.clone({
    withCredentials: true
  });

  if (token && !isRefreshRequest) {
    authReq = authReq.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      if (
        error.status === 401 &&
        token &&
        !isRefreshRequest
      ) {
        return authService.refreshToken().pipe(

          switchMap(newToken => {

            // حفظ الـ Access Token الجديد
            localStorage.setItem(TOKEN_KEY, newToken);

            // تحديث بيانات المستخدم في NgRx
            store.dispatch(AuthActions.loadCurrentUser());

            // إعادة الطلب الأصلي بالـ Token الجديد
            const retryReq = req.clone({
              withCredentials: true,
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });

            return next(retryReq);
          }),

          catchError(refreshError => {
            authService.clearSession();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};