import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getCurrentUser().pipe(
    take(1),
    map(user => {

      if (!user) {
        router.navigate(['/auth/login']);
        return false;
      }

      if (user.roleName !== 'Admin') {
        router.navigate(['/']);
        return false;
      }

      return true;
    })
  );
};