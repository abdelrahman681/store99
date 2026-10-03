import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Brand } from '../../../core/models/brand.model';
import { BrandService } from '../../../core/services/brandservice.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { apiErrorMessage } from '../../../core/utils/api-error';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-brand-management',
  standalone: true,
  imports: [FormsModule, RouterLink, PaginationComponent],
  templateUrl: './brand-management.component.html',
  styleUrl: './brand-management.component.css'
})
export class BrandManagementComponent implements OnInit {
  private brandService = inject(BrandService);
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);

  brands: Brand[] = [];
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

  /** the search box filters the brands of the page that is currently shown */
  get filtered(): Brand[] {
    const q = this.search.trim().toLowerCase();
    return q ? this.brands.filter(b => b.name.toLowerCase().includes(q)) : this.brands;
  }

  load(): void {
    this.loading = true;
    this.brandService.getBrands(this.currentPage, this.pageSize).subscribe({
      next: res => {
        this.brands = res?.data ?? [];
        this.totalCount = res?.countOfAllItem ?? this.brands.length;
        // use totalPages from the API, or work it out from the total count if it isn't sent
        this.totalPages = res?.totalPages || Math.ceil(this.totalCount / this.pageSize);
        this.loading = false;

        // the last brand of the last page was deleted → go back one page
        if (this.brands.length === 0 && this.currentPage > 1) {
          this.currentPage--;
          this.load();
        }
      },
      error: err => {
        this.loading = false;
        this.toast.error(apiErrorMessage(err, 'تعذر تحميل الماركات'));
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

  /** only checks the brands of the current page — the API should reject real duplicates */
  private exists(name: string, exceptId?: number): boolean {
    const n = name.trim().toLowerCase();
    return this.brands.some(b => b.id !== exceptId && b.name.trim().toLowerCase() === n);
  }

  // ---------- add ----------
  add(): void {
    const name = this.newName.trim();
    if (!name) {
      this.toast.warning('اكتب اسم الماركة');
      return;
    }
    if (this.exists(name)) {
      this.toast.warning('الماركة موجودة بالفعل');
      return;
    }

    this.saving = true;
    this.brandService.addBrand(name).subscribe({
      next: () => {
        this.saving = false;
        this.newName = '';
        this.toast.success('تمت إضافة الماركة ✅');
        this.load();
      },
      error: err => {
        this.saving = false;
        this.toast.error(apiErrorMessage(err, 'تعذر إضافة الماركة'));
      }
    });
  }

  // ---------- edit ----------
  startEdit(b: Brand): void {
    this.editingId = b.id;
    this.editName = b.name;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editName = '';
  }

  saveEdit(b: Brand): void {
    const name = this.editName.trim();
    if (!name) {
      this.toast.warning('اكتب اسم الماركة');
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
    this.brandService.editBrand(b.id, name).subscribe({
      next: () => {
        this.saving = false;
        this.cancelEdit();
        this.toast.success('تم تعديل الماركة');
        this.load();
      },
      error: err => {
        this.saving = false;
        this.toast.error(err?.status === 404 ? 'الماركة غير موجودة' : apiErrorMessage(err, 'تعذر تعديل الماركة'));
      }
    });
  }

  // ---------- delete ----------
  async remove(b: Brand): Promise<void> {
    const ok = await this.confirmService.ask({
      title: 'حذف الماركة',
      message: `هل تريد حذف "${b.name}"؟ لو في منتجات مرتبطة بيها ممكن الحذف يفشل.`,
      confirmText: 'حذف',
      tone: 'danger'
    });
    if (!ok) return;

    this.brandService.deleteBrand(b.id).subscribe({
      next: () => {
        this.toast.success('تم حذف الماركة');
        this.load();
      },
      error: err =>
        this.toast.error(
          err?.status === 404
            ? 'الماركة غير موجودة'
            : 'تعذر حذف الماركة — غالباً في منتجات مرتبطة بيها'
        )
    });
  }
}