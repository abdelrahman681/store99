import { ProductPathPipe } from '../../../shared/pipes/product-path.pipe';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { HeroArtComponent } from '../../../shared/components/hero-art/hero-art.component';
import { IllustrationComponent } from '../../../shared/components/illustration/illustration.component';
import { ProductsActions } from '../../../store/products/products.actions';
import {
  selectAllProducts,
  selectBrands,
  selectCategories,
  selectProductsLoading,
  selectProductsPaging
} from '../../../store/products/products.selectors';
import { BasketActions } from '../../../store/basket/basket.actions';
import { selectBasketItems } from '../../../store/basket/basket.selectors';
import { SortOption, Product } from '../../../core/models/product.model';
import { BasketItem } from '../../../core/models/basket.model';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent, ProductPathPipe, HeroArtComponent, IllustrationComponent],
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  private store = inject(Store);
  private destroyRef = inject(DestroyRef);
  private wishlistService = inject(WishlistService);
  private toast = inject(ToastService);
  private search$ = new Subject<string>();

  // Products
  products$ = this.store.select(selectAllProducts);
  brands$ = this.store.select(selectBrands);
  categories$ = this.store.select(selectCategories);
  loading$ = this.store.select(selectProductsLoading);
  paging$ = this.store.select(selectProductsPaging);

  // Filters
  searchValue = '';
  selectedBrandId = 0;
  selectedCategoryId = 0;
  sort: SortOption | '' = '';

  // Basket (used to stop adding more than the available stock)
  basketItems: BasketItem[] = [];

  // placeholders shown while the first page is loading
  readonly skeletons = Array.from({ length: 8 });

  get hasFilters(): boolean {
    return !!(this.searchValue || this.selectedBrandId || this.selectedCategoryId || this.sort);
  }

  ngOnInit(): void {
    this.store
      .select(selectBasketItems)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(items => (this.basketItems = items));

    this.store.dispatch(ProductsActions.loadLookups());
    this.load(1);

    this.search$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load(1));
  }

  readonly starSlots = [1, 2, 3, 4, 5];

  /** category chips under the hero: picking one filters the list (0 = all) */
  pickCategory(id: number): void {
    this.selectedCategoryId = id;
    this.load(1);
  }

  isLowStock(product: Product): boolean {
    return product.stockQuantity > 0 && product.stockQuantity <= 5;
  }

  scrollToProducts(): void {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onSearchChange(): void {
    this.search$.next(this.searchValue);
  }

  onFilterChange(): void {
    this.load(1);
  }

  resetFilters(): void {
    this.searchValue = '';
    this.selectedBrandId = 0;
    this.selectedCategoryId = 0;
    this.sort = '';
    this.load(1);
  }

  load(pageIndex: number): void {
    this.store.dispatch(
      ProductsActions.loadProducts({
        query: {
          pageIndex,
          pageSize: 8,
          searchValue: this.searchValue || undefined,
          productBrandId: this.selectedBrandId || undefined,
          productCategoryId: this.selectedCategoryId || undefined,
          sort: this.sort || undefined
        }
      })
    );
    if (pageIndex > 1) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private quantityInBasket(product: Product): number {
    return this.basketItems.find(item => item.productId === product.id)?.quantity ?? 0;
  }

  isAtStockLimit(product: Product): boolean {
    return this.quantityInBasket(product) >= product.stockQuantity;
  }

  addToBasket(product: Product): void {
    if (product.stockQuantity <= 0) {
      this.toast.error('المنتج غير متوفر حالياً');
      return;
    }

    if (this.quantityInBasket(product) + 1 > product.stockQuantity) {
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
        }
      })
    );
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
