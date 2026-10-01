import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { Analytics } from "@vercel/analytics/next"
import { ProductsManagementComponent } from './features/dashboard/products-management/products-management.component';
export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },

  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },

  {
    path: 'products',
    loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },

  {
    path: 'basket',
    loadComponent: () => import('./features/basket/basket-page/basket-page.component').then(m => m.BasketPageComponent)
  },

  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () => import('./features/orders/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () => import('./features/orders/order-list/order-list.component').then(m => m.OrderListComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./store/profile/profile.component')
        .then(m => m.ProfileComponent)
  },
  {
    path: 'addresses',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/addresses/address-list/address-list.component')
        .then(m => m.AddressListComponent)
  },
  {
    path: 'orders/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent)
  },
  {
    path: 'wishlist',
    canActivate: [authGuard],
    loadComponent: () => import('./features/wishlist/wishlist.component/wishlist.component.component').then(m => m.WishlistComponent)

  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/forgetpassword/forgetpassword.component')
        .then(m => m.ForgetpasswordComponent)
  },

  {
    path: 'verify-otp',
    loadComponent: () =>
      import('./features/verify-otp/verify-otp.component')
        .then(m => m.VerifyOtpComponent)
  },

  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/resetpassword/resetpassword.component')
        .then(m => m.ResetpasswordComponent)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },
  {
    path: 'dashboard/products',
    component: ProductsManagementComponent
  },
  {
    path: 'dashboard/users',
    loadComponent: () =>
      import('./features/dashboard/users-management/users-management.component')
        .then(m => m.UsersManagementComponent)
  },
  {
    path: 'dashboard/roles',
    loadComponent: () =>
      import('./features/dashboard/roles-management/roles-management.component')
        .then(m => m.RolesManagementComponent)
  },
  {
    path: 'dashboard/orders',
    loadComponent: () =>
      import('./features/dashboard/orders-management/orders-management.component')
        .then(m => m.OrdersManagementComponent)
  },

  {
    path: 'contact',
    loadComponent: () =>
      import('./features/contact/contact.component')
        .then(m => m.ContactComponent)
  },


{
  path: 'notifications',
  loadComponent: () =>
    import('./features/notifications/notifications/notifications.component')
      .then(m => m.NotificationsComponent)
},
  
  { path: '**', redirectTo: 'products' },
];
