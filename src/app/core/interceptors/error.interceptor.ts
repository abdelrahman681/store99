import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {

  return next(req).pipe(

    catchError((error: HttpErrorResponse) => {

      // الـ authInterceptor هو المسؤول عن التعامل
      // مع 401 وعمل Refresh Token
      return throwError(() => error);
    })

  );
};

