import { ProductPathPipe } from '../../../shared/pipes/product-path.pipe';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import { BasketActions } from '../../../store/basket/basket.actions';
import { selectBasketItems, selectBasketSubTotal } from '../../../store/basket/basket.selectors';
import { selectIsAuthenticated } from '../../../store/auth/auth.selectors';
import { selectAllProducts } from '../../../store/products/products.selectors';
import { BasketItem } from '../../../core/models/basket.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-basket-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductPathPipe],
  templateUrl: './basket-page.component.html'
})
export class BasketPageComponent {
  private store = inject(Store);
  private router = inject(Router);
  private toast = inject(ToastService);

  items$ = this.store.select(selectBasketItems);
  subTotal$ = this.store.select(selectBasketSubTotal);
  isAuthenticated$ = this.store.select(selectIsAuthenticated);

  // the original products carry stockQuantity
  products$ = this.store.select(selectAllProducts);

  increment(item: BasketItem): void {
    this.products$.pipe(take(1)).subscribe(products => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return;

      if (item.quantity >= product.stockQuantity) {
        this.toast.warning(`المتاح فقط ${product.stockQuantity} قطعة من هذا المنتج`);
        return;
      }

      this.store.dispatch(BasketActions.incrementItemQuantity({ productId: item.productId }));
    });
  }

  decrement(productId: number): void {
    this.store.dispatch(BasketActions.decrementItemQuantity({ productId }));
  }

  remove(item: BasketItem): void {
    this.store.dispatch(BasketActions.removeItemFromBasket({ productId: item.productId }));
    this.toast.info(`تم حذف "${item.name}" من السلة`);
  }

  checkout(): void {
    this.isAuthenticated$.pipe(take(1)).subscribe(isAuthenticated => {
      if (!isAuthenticated) {
        this.toast.info('سجّل دخولك الأول عشان تكمل الشراء');
      }
      this.router.navigate([isAuthenticated ? '/checkout' : '/auth/login']);
    });
  }
}
