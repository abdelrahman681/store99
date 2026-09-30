import { Component, OnInit, inject, signal } from '@angular/core';
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
import { BasketActions } from './store/basket/basket.actions';
import { ProductsActions } from './store/products/products.actions';

// On the products page the logo stays at least this long (so it never just flashes) and until products arrive;
// when the app is opened straight on another page it only shows briefly.
const MIN_SPLASH_MS = 1500;
const MIN_SPLASH_OTHER_MS = 600;
const MAX_SPLASH_MS = 8000;
const SPLASH_FADE_MS = 600;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastContainerComponent, ConfirmDialogComponent],
  template: `
    @if (splashVisible()) {
      <div class="app-splash" [class.is-leaving]="splashLeaving()" role="status" aria-label="جاري التحميل">
        <div class="app-splash__logo">
          <span class="app-splash__ring"></span>
          <span class="app-splash__pulse"></span>
          <svg class="app-splash__bag" viewBox="0 0 64 64" width="46" height="46" fill="none" stroke="currentColor"
               stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M14 22h36l-3 30a4 4 0 0 1-4 3.6H21a4 4 0 0 1-4-3.6L14 22z"/>
            <path d="M23 22v-3a9 9 0 0 1 18 0v3"/>
          </svg>
        </div>
        <div class="app-splash__brand">Store99</div>
        <div class="app-splash__dots"><span></span><span></span><span></span></div>
      </div>
    }

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

  splashVisible = signal(true);
  splashLeaving = signal(false);

  ngOnInit(): void {
    this.startSplash();

    // Restore session (the token is saved by AuthService / the auth interceptor under this key)
    if (localStorage.getItem('talabat_token')) {
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
    this.splashLeaving.set(true);
    setTimeout(() => this.splashVisible.set(false), SPLASH_FADE_MS);
  }
}
