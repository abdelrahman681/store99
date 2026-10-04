import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, EMPTY, catchError, switchMap, tap } from 'rxjs';

import { BasketActions } from '../../../store/basket/basket.actions';
import { selectBasketItems } from '../../../store/basket/basket.selectors';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../core/models/product.model';
import { productIdFromParam, productSlug } from '../../../core/utils/product-slug';
import { ProductReviewsComponent } from '../../../shared/components/product-reviews/product-reviews.component';
import { BasketItem } from '../../../core/models/basket.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductReviewsComponent],
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  private destroyRef = inject(DestroyRef);
  private productService = inject(ProductService);
  private wishlistService = inject(WishlistService);
  private toast = inject(ToastService);
  private location = inject(Location);
  private titleService = inject(Title);

  loading = true;
  readonly starSlots = [1, 2, 3, 4, 5];

  // the URL segment is "10-iphone-15" (or just "10"): the number in front is the product id
  private routeParam = this.route.snapshot.paramMap.get('id');
  productId = productIdFromParam(this.routeParam) ?? 0;
  private refresh$ = new BehaviorSubject<void>(undefined);

  product$ = this.refresh$.pipe(
    switchMap(() =>
      this.productService.getProductById(this.productId).pipe(
        tap(product => {
          this.loading = false;
          this.showNameInUrl(product);
        }),
        catchError(() => {
          this.loading = false;
          this.toast.error('تعذر تحميل المنتج');
          this.router.navigate(['/products']);
          return EMPTY;
        })
      )
    )
  );

  /** /products/10 -> /products/10-iphone-15 (no navigation, no extra history entry), and the tab title */
  private showNameInUrl(product: Product): void {
    this.titleService.setTitle(`${product.name} | Store99`);

    const wanted = productSlug(product.id, product.name);
    if (this.routeParam === wanted) return;

    this.routeParam = wanted;
    this.location.replaceState(this.router.serializeUrl(this.router.createUrlTree(['/products', wanted])));
  }

  /** a review was added / edited / deleted → reload the product so its average rating is current */
  onReviewsChanged(): void {
    this.refresh$.next();
  }

  basketItems: BasketItem[] = [];
  quantity = 1;

  ngOnInit(): void {
    this.store
      .select(selectBasketItems)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(items => (this.basketItems = items));
  }

  private quantityInBasket(product: Product): number {
    return this.basketItems.find(item => item.productId === product.id)?.quantity ?? 0;
  }

  isAtStockLimit(product: Product): boolean {
    return this.quantityInBasket(product) >= product.stockQuantity;
  }

  /** how many more the customer can still add */
  remaining(product: Product): number {
    return Math.max(0, product.stockQuantity - this.quantityInBasket(product));
  }

  changeQuantity(delta: number, product: Product): void {
    const max = Math.max(1, this.remaining(product));
    this.quantity = Math.min(max, Math.max(1, (Number(this.quantity) || 1) + delta));
  }

  addToBasket(product: Product): void {
    const qty = Math.max(1, Number(this.quantity) || 1);

    if (product.stockQuantity <= 0) {
      this.toast.error('المنتج غير متوفر حالياً');
      return;
    }

    if (this.quantityInBasket(product) + qty > product.stockQuantity) {
      this.toast.warning(`لا يمكن إضافة المزيد. المتاح فقط ${product.stockQuantity} قطعة`);
      return;
    }

    // the "added to basket" toast is shown by BasketEffects
    this.store.dispatch(
      BasketActions.addItemToBasket({
        item: {
          id: product.id,
          productId: product.id,
          name: product.name,
          pictureUrl: product.pictureUrl,
          brand: product.brandName ?? '',
          category: product.categoryName ?? '',
          price: product.price,
          quantity: 1
        },
        quantity: qty
      })
    );
    this.quantity = 1;
  }

  addToWishlist(product: Product): void {
    this.wishlistService.addProductToWishlist(product.id).subscribe({
      next: () => this.toast.success('تمت إضافة المنتج إلى المفضلة ❤️'),
      error: err => {
        if (err?.status === 401) {
          this.toast.info('سجّل دخولك الأول عشان تضيف للمفضلة');
        } else if (err?.status === 400) {
          this.toast.info('المنتج موجود بالفعل في المفضلة ❤️');
        } else {
          this.toast.error('حدث خطأ أثناء إضافة المنتج إلى المفضلة');
        }
      }
    });
  }
}
