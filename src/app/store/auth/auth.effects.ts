import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { UserDTO } from '../../core/models/user.model';
import { AuthActions } from './auth.actions';

const TOKEN_KEY = 'talabat_token';
const USER_KEY = 'talabat_user';

function persistUser(user: UserDTO) {
  localStorage.setItem(TOKEN_KEY, user.token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  login$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.login),
    exhaustMap(({ payload }) => this.authService.login(payload).pipe(
      map(user => AuthActions.loginSuccess({ user })),
      catchError((err: HttpErrorResponse) => of(AuthActions.loginFailure({
        error: err.error?.message ?? 'بيانات الدخول غير صحيحة'
      })))
    ))
  ));

  register$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.register),
    exhaustMap(({ payload }) => this.authService.register(payload).pipe(
      map(user => AuthActions.registerSuccess({ user })),
      catchError((err: HttpErrorResponse) => of(AuthActions.registerFailure({
        error: err.error?.message ?? 'تعذر إنشاء الحساب'
      })))
    ))
  ));

persistAndRedirect$ = createEffect(() => this.actions$.pipe(

  ofType(
    AuthActions.loginSuccess,
    AuthActions.googleLoginSuccess,
    AuthActions.registerSuccess
  ),

  tap(({ user }) => {

    persistUser(user);

    this.toast.success(`أهلاً ${user.displayName} 👋`);

    this.router.navigate(['/products']);

  })

), { dispatch: false });

  loadCurrentUser$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.loadCurrentUser),
    exhaustMap(() => this.authService.getCurrentUser().pipe(
      map(user => AuthActions.loadCurrentUserSuccess({ user })),
      catchError(() => of(AuthActions.loadCurrentUserFailure()))
    ))
  ));

  logout$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.logout),
    tap(() => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }),
    map(() => AuthActions.logoutSuccess())
  ));

googleLogin$ = createEffect(() => this.actions$.pipe(

  ofType(AuthActions.googleLogin),

  exhaustMap(({ idToken }) =>
    this.authService.googleLogin(idToken).pipe(

      map(user =>
        AuthActions.googleLoginSuccess({ user })
      ),

      catchError((err: HttpErrorResponse) =>
        of(
          AuthActions.googleLoginFailure({
            error:
              err.error?.message ??
              'فشل تسجيل الدخول باستخدام Google'
          })
        )
      )

    )
  )

));

  logoutRedirect$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.logoutSuccess),
    tap(() => {
      this.toast.info('تم تسجيل الخروج');
      this.router.navigate(['/auth/login']);
    })
  ), { dispatch: false });

  // Failures show up as toasts (login / register pages no longer render inline alerts)
  authFailureToast$ = createEffect(() => this.actions$.pipe(
    ofType(
      AuthActions.loginFailure,
      AuthActions.registerFailure,
      AuthActions.googleLoginFailure
    ),
    tap(({ error }) => this.toast.error(error))
  ), { dispatch: false });
}
