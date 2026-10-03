import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/categoryservice.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { apiErrorMessage } from '../../../core/utils/api-error';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [FormsModule, RouterLink, PaginationComponent],
  templateUrl: './category-management.component.html',
  styleUrl: './category-management.component.css'
})
export class CategoryManagementComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);

  category: Category[] = [];
  loading = true;
  saving = false;

  search = '';
  newName = '';
  editingId: number | null = null;
  editName = '';

  // paging (done by the API)
  currentPage = 1;
  readonly pageSize = 10;
  totalPages = 0;
  totalCount = 0;

  ngOnInit(): void {
    this.load();
  }

  /** the search box filters the category of the page that is currently shown */
  get filtered(): Category[] {
    const q = this.search.trim().toLowerCase();
    return q ? this.category.filter(b => b.name.toLowerCase().includes(q)) : this.category;
  }

  load(): void {
    this.loading = true;
    this.categoryService.getCategories(this.currentPage, this.pageSize).subscribe({
      next: res => {
        this.category = res?.data ?? [];
        this.totalCount = res?.countOfAllItem ?? this.category.length;
        // use totalPages from the API, or work it out from the total count if it isn't sent
        this.totalPages = res?.totalPages || Math.ceil(this.totalCount / this.pageSize);
        this.loading = false;

        // the last brand of the last page was deleted → go back one page
        if (this.category.length === 0 && this.currentPage > 1) {
          this.currentPage--;
          this.load();
        }
      },
      error: err => {
        this.loading = false;
        this.toast.error(apiErrorMessage(err, 'تعذر تحميل الفئات'));
      }
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.cancelEdit();
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** only checks the Category of the current page — the API should reject real duplicates */
  private exists(name: string, exceptId?: number): boolean {
    const n = name.trim().toLowerCase();
    return this.category.some(b => b.id !== exceptId && b.name.trim().toLowerCase() === n);
  }

  // ---------- add ----------
  add(): void {
    const name = this.newName.trim();
    if (!name) {
      this.toast.warning('اكتب اسم الفئة');
      return;
    }
    if (this.exists(name)) {
      this.toast.warning('الفئة موجودة بالفعل');
      return;
    }

    this.saving = true;
    this.categoryService.addCategory(name).subscribe({
      next: () => {
        this.saving = false;
        this.newName = '';
        this.toast.success('تمت إضافة الفئة ✅');
        this.load();
      },
      error: err => {
        this.saving = false;
        this.toast.error(apiErrorMessage(err, 'تعذر إضافة الفئة'));
      }
    });
  }

  // ---------- edit ----------
  startEdit(b: Category): void {
    this.editingId = b.id;
    this.editName = b.name;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editName = '';
  }

  saveEdit(b: Category): void {
    const name = this.editName.trim();
    if (!name) {
      this.toast.warning('اكتب اسم الفئة');
      return;
    }
    if (name === b.name) {
      this.cancelEdit();
      return;
    }
    if (this.exists(name, b.id)) {
      this.toast.warning('الاسم مستخدم في ماركة تانية');
      return;
    }

    this.saving = true;
    this.categoryService.editCategory(b.id, name).subscribe({
      next: () => {
        this.saving = false;
        this.cancelEdit();
        this.toast.success('تم تعديل الفئة');
        this.load();
      },
      error: err => {
        this.saving = false;
        this.toast.error(err?.status === 404 ? 'الفئة غير موجودة' : apiErrorMessage(err, 'تعذر تعديل الفئة'));
      }
    });
  }

  // ---------- delete ----------
  async remove(b: Category): Promise<void> {
    const ok = await this.confirmService.ask({
      title: 'حذف الفئة',
      message: `هل تريد حذف "${b.name}"؟ لو في منتجات مرتبطة بيها ممكن الحذف يفشل.`,
      confirmText: 'حذف',
      tone: 'danger'
    });
    if (!ok) return;

    this.categoryService.deleteCategory(b.id).subscribe({
      next: () => {
        this.toast.success('تم حذف الفئة');
        this.load();
      },
      error: err =>
        this.toast.error(
          err?.status === 404
            ? 'الفئة غير موجودة'
            : 'تعذر حذف الفئة — غالباً في منتجات مرتبطة بيها'
        )
    });
  }
}