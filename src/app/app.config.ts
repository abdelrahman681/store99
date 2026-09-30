import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar';
import { Analytics } from "@vercel/analytics/next"
registerLocaleData(localeAr);
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

import { authFeatureKey } from './store/auth/auth.reducer';
import { authReducer } from './store/auth/auth.reducer';
import { AuthEffects } from './store/auth/auth.effects';

import { productsFeatureKey, productsReducer } from './store/products/products.reducer';
import { ProductsEffects } from './store/products/products.effects';

import { basketFeatureKey, basketReducer } from './store/basket/basket.reducer';
import { BasketEffects } from './store/basket/basket.effects';

import { ordersFeatureKey, ordersReducer } from './store/orders/orders.reducer';
import { OrdersEffects } from './store/orders/orders.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideStore({
      [authFeatureKey]: authReducer,
      [productsFeatureKey]: productsReducer,
      [basketFeatureKey]: basketReducer,
      [ordersFeatureKey]: ordersReducer,
    }),
    provideEffects([AuthEffects, ProductsEffects, BasketEffects, OrdersEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
  ],
};
