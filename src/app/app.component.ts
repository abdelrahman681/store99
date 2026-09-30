import { DOCUMENT } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { combineLatest, filter, race, shareReplay, switchMap, take, timer } from 'rxjs';
import { Analytics } from "@vercel/analytics/next"
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { AuthActions } from './store/auth/auth.actions';
import { AuthService } from './core/services/auth.service';
import { BasketActions } from './store/basket/basket.actions';
import { ProductsActions } from './store/products/products.actions';

// On the products page the logo stays at least this long (so it never just flashes) and until products arrive;
// when the app is opened straight on another page it only shows briefly.
const MIN_SPLASH_MS = 2600; // long enough for the logo animation to finish
const MIN_SPLASH_OTHER_MS = 2600;
const MAX_SPLASH_MS = 8000;
const SPLASH_FADE_MS = 600;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastContainerComponent, ConfirmDialogComponent],
  template: `
    <div class="app-shell">
      <app-navbar></app-navbar>
      <main class="app-main">
        <div class="container page-container">
          <router-outlet></router-outlet>
        </div>
      </main>
      <app-footer></app-footer>
    </div>

    <app-toast-container></app-toast-container>
    <app-confirm-dialog></app-confirm-dialog>
  `
})
export class AppComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);
  private actions$ = inject(Actions);
  private authService = inject(AuthService);

  private document = inject(DOCUMENT);

  ngOnInit(): void {
    this.startSplash();

    // Restore session (the token is saved by AuthService / the auth interceptor under this key)
    if (localStorage.getItem('talabat_token')) {
      // Show the saved user right away (so the navbar keeps the dashboard link after a refresh),
      // then refresh it from the API.
      const saved = this.authService.currentUser();
      if (saved) this.store.dispatch(AuthActions.loadCurrentUserSuccess({ user: saved }));
      this.store.dispatch(AuthActions.loadCurrentUser());
    }
    this.store.dispatch(BasketActions.loadBasket());
  }

  /**
   * Splash flow: the app opens on the products page (the '' route redirects there).
   * The animated logo stays up until the first products response arrives (success or failure),
   * but no shorter than MIN_SPLASH_MS and no longer than MAX_SPLASH_MS.
   * If the app was opened on some other deep link, it only shows for MIN_SPLASH_OTHER_MS.
   */
  private startSplash(): void {
    const productsSettled$ = this.actions$.pipe(
      ofType(ProductsActions.loadProductsSuccess, ProductsActions.loadProductsFailure),
      take(1),
      shareReplay(1)
    );
    productsSettled$.subscribe(); // start listening right away so the result can't be missed

    const firstNavigation$ = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      take(1)
    );

    const ready$ = firstNavigation$.pipe(
      switchMap(e =>
        this.isProductsList(e.urlAfterRedirects)
          ? combineLatest([productsSettled$, timer(MIN_SPLASH_MS)])
          : timer(MIN_SPLASH_OTHER_MS)
      )
    );

    race(ready$, timer(MAX_SPLASH_MS))
      .pipe(take(1))
      .subscribe(() => this.hideSplash());
  }

  private isProductsList(url: string): boolean {
    const path = url.split(/[?#]/)[0];
    return path === '/' || path === '/products';
  }

  private hideSplash(): void {
    // the splash is plain HTML in index.html — fade it out, then remove it
    const splash = this.document.getElementById('app-splash');
    if (!splash) return;
    splash.classList.add('is-leaving');
    setTimeout(() => splash.remove(), SPLASH_FADE_MS);
  }
}
