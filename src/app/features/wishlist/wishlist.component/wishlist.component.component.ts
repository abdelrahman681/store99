import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ToastService } from '../../../core/services/toast.service';
import { WishlistData, WishlistPagination } from '../../../core/models/product.model';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent],
  templateUrl: './wishlist.component.component.html'
})
export class WishlistComponent implements OnInit {
  private wishlistService = inject(WishlistService);
  private toast = inject(ToastService);

  wishlist: WishlistData[] = [];
  pageIndex = 1;
  pageSize = 6;
  totalPages = 0;
  loading = false;
  loadFailed = false;

  readonly skeletons = Array.from({ length: 3 });

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.loading = true;
    this.loadFailed = false;

    this.wishlistService.getAllWishlist(this.pageIndex, this.pageSize).subscribe({
      next: (response: WishlistPagination) => {
        this.wishlist = response.data ?? [];
        this.totalPages = response.totalPages ?? 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.loadFailed = true;
        this.toast.error('تعذر تحميل المفضلة، حاول مرة تانية');
      }
    });
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.loadWishlist();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  remove(productId: number): void {
    this.wishlistService.removeProductFromWishlist(productId).subscribe({
      next: () => {
        this.wishlist = this.wishlist.filter(x => x.productId !== productId);
        this.toast.info('تم حذف المنتج من المفضلة');

        // last item on this page was removed → go back a page (or reload)
        if (this.wishlist.length === 0) {
          this.pageIndex = Math.max(1, this.pageIndex - 1);
          this.loadWishlist();
        }
      },
      error: () => this.toast.error('تعذر حذف المنتج من المفضلة')
    });
  }
}
