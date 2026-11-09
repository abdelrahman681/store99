import { ProductPathPipe } from '../../../shared/pipes/product-path.pipe';
import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnInit,
  inject,
  ElementRef,
  ViewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  switchMap,
  of,
  catchError,
  finalize
} from 'rxjs';

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
import { Category } from '../../../core/models/category.model';

import { CategoryService } from '../../../core/services/categoryservice.service';
import { ProductService } from '../../../core/services/product.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    PaginationComponent,
    ProductPathPipe,
    HeroArtComponent,
    IllustrationComponent
  ],
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {

  private store = inject(Store);
  private destroyRef = inject(DestroyRef);
  private wishlistService = inject(WishlistService);
  private toast = inject(ToastService);
  private categoryService = inject(CategoryService);
  private productService = inject(ProductService);

  private search$ = new Subject<string>();

  // Products - القائمة الرئيسية فقط
  products$ = this.store.select(selectAllProducts);
  brands$ = this.store.select(selectBrands);
  categories$ = this.store.select(selectCategories);
  loading$ = this.store.select(selectProductsLoading);
  paging$ = this.store.select(selectProductsPaging);

  @ViewChild('categoryStrip')
  categoryStrip!: ElementRef<HTMLDivElement>;

  // Filters
  searchValue = '';
  selectedBrandId = 0;
  selectedCategoryId = 0;
  sort: SortOption | '' = '';

  // Search autocomplete - منفصل عن القائمة الرئيسية
  showSearchSuggestions = false;
  searchSuggestions: Product[] = [];
  searchLoading = false;

  readonly minimumSearchLength = 3;

  // Basket
  basketItems: BasketItem[] = [];

  // Loading placeholders
  readonly skeletons = Array.from({ length: 8 });

  readonly starSlots = [1, 2, 3, 4, 5];

  get hasFilters(): boolean {
    // البحث هنا خاص بالاقتراحات فقط، وليس فلترًا للقائمة الرئيسية
    return !!(
      this.selectedBrandId ||
      this.selectedCategoryId ||
      this.sort
    );
  }

  ngOnInit(): void {

    this.store
      .select(selectBasketItems)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(items => {
        this.basketItems = items;
      });

    this.store.dispatch(ProductsActions.loadLookups());

    this.loadMoreCategories();

    this.load(1);

    // Search suggestions - API مستقل عن NgRx products list
    this.search$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),

        switchMap(value => {

          if (value.length < this.minimumSearchLength) {
            this.searchLoading = false;
            return of([]);
          }

          this.searchLoading = true;

          return this.productService
            .searchProductSuggestions(value)
            .pipe(
              catchError(() => of([])),
              finalize(() => {
                this.searchLoading = false;
              })
            );
        }),

        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(products => {
        this.searchSuggestions = products;
      });
  }

  // ================= CATEGORY CHIPS =================

  chipCategories: Category[] = [];
  chipPage = 0;
  chipHasMore = true;
  chipLoading = false;

  private readonly chipPageSize = 10;

  scrollCategories(direction: 'left' | 'right'): void {

    const container = this.categoryStrip?.nativeElement;

    if (!container) return;

    container.scrollBy({
      left: direction === 'left' ? -250 : 250,
      behavior: 'smooth'
    });
  }

  loadMoreCategories(): void {

    if (this.chipLoading || !this.chipHasMore) return;

    this.chipLoading = true;

    const next = this.chipPage + 1;

    this.categoryService.getCategories(next, this.chipPageSize)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: res => {

          const known = new Set(
            this.chipCategories.map(c => c.id)
          );

          const fresh = (res?.data ?? [])
            .filter(c => !known.has(c.id));

          this.chipCategories = [
            ...this.chipCategories,
            ...fresh
          ];

          this.chipPage = next;

          this.chipHasMore =
            fresh.length > 0 &&
            (
              res?.totalPages
                ? next < res.totalPages
                : (res?.data?.length ?? 0) >= this.chipPageSize
            );

          this.chipLoading = false;

          if (next > 1 && fresh.length) {

            setTimeout(() => {

              document
                .querySelector(
                  `.cat-chip[data-id="${fresh[0].id}"]`
                )
                ?.scrollIntoView({
                  behavior: 'smooth',
                  inline: 'center',
                  block: 'nearest'
                });

            });

          }

        },

        error: () => {

          this.chipLoading = false;

          this.toast.error('تعذر تحميل المزيد من الفئات');

        }

      });
  }

  pickCategory(id: number): void {

    this.selectedCategoryId = id;

    this.load(1);
  }

  // ================= SEARCH =================

  onSearchChange(): void {

    const value = this.searchValue.trim();

    if (value.length < this.minimumSearchLength) {

      this.showSearchSuggestions = false;
      this.searchSuggestions = [];
      this.searchLoading = false;

      // إلغاء أي بحث سابق بعد انتهاء debounce
      this.search$.next('');

      return;
    }

    this.showSearchSuggestions = true;

    // البحث هنا لا يستدعي load() ولا يغير القائمة الرئيسية
    this.search$.next(value);
  }

  onSearchFocus(): void {

    if (this.searchValue.trim().length >= this.minimumSearchLength) {
      this.showSearchSuggestions = true;
    }
  }

  closeSearchSuggestions(): void {

    this.showSearchSuggestions = false;
  }

  selectSearchProduct(): void {

    this.closeSearchSuggestions();
    this.searchSuggestions = [];
  }

  // ================= FILTERS =================

  onFilterChange(): void {

    this.load(1);
  }

  resetFilters(): void {

    this.searchValue = '';
    this.showSearchSuggestions = false;
    this.searchSuggestions = [];
    this.searchLoading = false;

    this.selectedBrandId = 0;
    this.selectedCategoryId = 0;
    this.sort = '';

    this.search$.next('');

    this.load(1);
  }

  // ================= PRODUCTS =================

  load(pageIndex: number): void {

    this.store.dispatch(
      ProductsActions.loadProducts({

        query: {

          pageIndex,

          // القائمة الرئيسية لا تتأثر بنص السيرش
          pageSize: 8,

          searchValue: undefined,

          productBrandId: this.selectedBrandId || undefined,

          productCategoryId: this.selectedCategoryId || undefined,

          sort: this.sort || undefined

        }

      })
    );

    if (pageIndex > 1) {

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

    }
  }

  // ================= STOCK =================

  private quantityInBasket(product: Product): number {

    return this.basketItems.find(
      item => item.productId === product.id
    )?.quantity ?? 0;
  }

  isLowStock(product: Product): boolean {

    return product.stockQuantity > 0 &&
      product.stockQuantity <= 5;
  }

  isAtStockLimit(product: Product): boolean {

    return this.quantityInBasket(product) >= product.stockQuantity;
  }

  // ================= SCROLL =================

  scrollToProducts(): void {

    document
      .getElementById('products')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
  }

  // ================= BASKET =================

  addToBasket(product: Product): void {

    if (product.stockQuantity <= 0) {

      this.toast.error('المنتج غير متوفر حالياً');

      return;
    }

    if (
      this.quantityInBasket(product) + 1 >
      product.stockQuantity
    ) {

      this.toast.warning(
        `لا يمكن إضافة المزيد. المتاح فقط ${product.stockQuantity} قطعة`
      );

      return;
    }

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

  // ================= WISHLIST =================

  addToWishlist(product: Product): void {

    this.wishlistService
      .addProductToWishlist(product.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: () => {

          this.toast.success(
            'تمت إضافة المنتج إلى المفضلة ❤️'
          );

        },

        error: err => {

          if (err?.status === 401) {

            this.toast.info(
              'سجّل دخولك الأول عشان تضيف للمفضلة'
            );

          } else if (err?.status === 400) {

            this.toast.info(
              'المنتج موجود بالفعل في المفضلة ❤️'
            );

          } else {

            this.toast.error(
              'حدث خطأ أثناء إضافة المنتج إلى المفضلة'
            );

          }

        }

      });
  }
}