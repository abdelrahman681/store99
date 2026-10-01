import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Review } from '../../../core/models/review.model';
import { ReviewService } from '../../../core/services/review.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { UserDTO } from '../../../core/models/user.model';

const PAGE_SIZE = 5;

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-reviews.component.html'
})
export class ProductReviewsComponent implements OnInit {
  private reviewService = inject(ReviewService);
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private store = inject(Store);

  @Input({ required: true }) productId!: number;
  /** tells the product page to refresh its average rating / count */
  @Output() changed = new EventEmitter<void>();

  readonly stars = [1, 2, 3, 4, 5];

  user: UserDTO | null = null;
  reviews: Review[] = [];
  pageIndex = 1;
  hasMore = false;
  loading = true;
  loadingMore = false;

  // form (used for both "add" and "edit")
  rating = 0;
  hoverRating = 0;
  comment = '';
  editingId: number | null = null;
  saving = false;

  // reviews created in this session are certainly the current user's
  private myIds = new Set<number>();

  ngOnInit(): void {
    this.store.select(selectCurrentUser).subscribe(u => (this.user = u ?? null));
    this.load(1);
  }

  load(page: number): void {
    if (page === 1) this.loading = true; else this.loadingMore = true;

    this.reviewService.getReviews(this.productId, page, PAGE_SIZE).subscribe({
      next: result => {
        const data = result?.data ?? [];
        this.reviews = page === 1 ? data : [...this.reviews, ...data];
        this.pageIndex = page;
        this.hasMore = data.length >= PAGE_SIZE;
        this.loading = false;
        this.loadingMore = false;
      },
      error: () => {
        this.loading = false;
        this.loadingMore = false;
        this.toast.error('تعذر تحميل التقييمات');
      }
    });
  }

  // ---------- ownership ----------
  isMine(r: Review): boolean {
    if (!this.user) return false;
    if (this.myIds.has(r.id)) return true;

    const mail = this.user.email?.toLowerCase();
    const emails = [r['userEmail'], r['email'], r['buyerEmail'], r['appUserEmail'], r['reviewerEmail']];
    if (mail && emails.some(e => typeof e === 'string' && e.toLowerCase() === mail)) return true;

    const name = this.user.displayName?.trim().toLowerCase();
    const names = [r['userName'], r['displayName'], r['reviewerName'], r['appUserName'], r['customerName']];
    return !!name && names.some(n => typeof n === 'string' && n.trim().toLowerCase() === name);
  }

  author(r: Review): string {
    return r['userName'] || r['displayName'] || r['reviewerName'] || r['customerName'] || 'مستخدم';
  }

  initial(r: Review): string {
    return this.author(r).trim().charAt(0).toUpperCase() || '?';
  }

  when(r: Review): string | null {
    return r['createdAt'] || r['dateOfCreate'] || r['date'] || r['createdOn'] || null;
  }

  // ---------- form ----------
  setRating(n: number): void { this.rating = n; }

  startEdit(r: Review): void {
    this.editingId = r.id;
    this.rating = r.rating;
    this.comment = r.comment ?? '';
    document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.rating = 0;
    this.comment = '';
  }

  private errorText(err: any, fallback: string): string {
    const message = String(err?.error?.message ?? err?.error ?? '');
    if (/already/i.test(message)) return 'لقد قمت بتقييم هذا المنتج من قبل';
    if (err?.status === 401) return 'سجّل دخولك الأول عشان تقيّم المنتج';
    return fallback;
  }

  submit(): void {
    if (this.rating < 1) {
      this.toast.warning('اختر عدد النجوم الأول');
      return;
    }
    const comment = this.comment.trim();
    this.saving = true;

    if (this.editingId !== null) {
      this.reviewService.updateReview({ id: this.editingId, rating: this.rating, comment }).subscribe({
        next: () => {
          this.saving = false;
          this.toast.success('تم تعديل تقييمك');
          this.cancelEdit();
          this.load(1);
          this.changed.emit();
        },
        error: err => {
          this.saving = false;
          this.toast.error(this.errorText(err, 'تعذر تعديل التقييم'));
        }
      });
      return;
    }

    this.reviewService.addReview({ productId: this.productId, rating: this.rating, comment }).subscribe({
      next: created => {
        this.saving = false;
        if (created?.id != null) this.myIds.add(created.id);
        this.toast.success('شكراً! تم إضافة تقييمك ⭐');
        this.cancelEdit();
        this.load(1);
        this.changed.emit();
      },
      error: err => {
        this.saving = false;
        this.toast.error(this.errorText(err, 'تعذر إضافة التقييم'));
      }
    });
  }

  async remove(r: Review): Promise<void> {
    const ok = await this.confirmService.ask({
      title: 'حذف التقييم',
      message: 'هل تريد حذف تقييمك لهذا المنتج؟',
      confirmText: 'حذف',
      tone: 'danger'
    });
    if (!ok) return;

    this.reviewService.deleteReview(r.id).subscribe({
      next: () => {
        this.myIds.delete(r.id);
        if (this.editingId === r.id) this.cancelEdit();
        this.toast.success('تم حذف التقييم');
        this.load(1);
        this.changed.emit();
      },
      error: () => this.toast.error('تعذر حذف التقييم')
    });
  }
}
