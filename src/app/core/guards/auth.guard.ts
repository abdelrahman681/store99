import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import { selectIsAuthenticated } from '../../store/auth/auth.selectors';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);
  const auth = inject(AuthService);

  return store.select(selectIsAuthenticated).pipe(
    take(1),
    map(isAuthenticated => {
      // After a page refresh the store is empty until /GetCurrentUser answers, so also trust the
      // saved session (token + user) — otherwise a refresh on /orders or /addresses kicks you to login.
      const hasSavedSession = !!localStorage.getItem('talabat_token') && !!auth.currentUser();

      if (isAuthenticated || hasSavedSession) return true;
      router.navigate(['/auth/login']);
      return false;
    })
  );
};
