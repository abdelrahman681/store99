import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IdentityRoleDTO } from '../../../core/models/role.model';
import { RoleService } from '../../../core/services/role.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { apiErrorMessage } from '../../../core/utils/api-error';

@Component({
  selector: 'app-roles-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './roles-management.component.html'
})
export class RolesManagementComponent implements OnInit {
  private roleService = inject(RoleService);
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);

  roles: IdentityRoleDTO[] = [];
  loading = true;
  saving = false;

  newName = '';
  editingId: string | null = null;
  editName = '';

  ngOnInit(): void {
    this.load();
  }

  /** the Admin role is what gives access to this page — never allow editing / deleting it from here */
  isProtected(r: IdentityRoleDTO): boolean {
    return r.name?.trim().toLowerCase() === 'admin';
  }

  load(): void {
    this.loading = true;
    this.roleService.getAll().subscribe({
      next: roles => {
        this.roles = roles ?? [];
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.toast.error(apiErrorMessage(err, 'تعذر تحميل الأدوار'));
      }
    });
  }

  add(): void {
    const name = this.newName.trim();
    if (!name) {
      this.toast.warning('اكتب اسم الدور');
      return;
    }
    this.saving = true;
    this.roleService.create(name).subscribe({
      next: () => {
        this.saving = false;
        this.newName = '';
        this.toast.success('تم إنشاء الدور بنجاح');
        this.load();
      },
      error: err => {
        this.saving = false;
        const message = apiErrorMessage(err, 'تعذر إنشاء الدور');
        this.toast.error(/alredy|already/i.test(message) ? 'الدور موجود بالفعل' : message);
      }
    });
  }

  startEdit(r: IdentityRoleDTO): void {
    this.editingId = r.id;
    this.editName = r.name;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editName = '';
  }

  saveEdit(r: IdentityRoleDTO): void {
    const name = this.editName.trim();
    if (!name) {
      this.toast.warning('اكتب اسم الدور');
      return;
    }
    if (name === r.name) {
      this.cancelEdit();
      return;
    }
    this.saving = true;
    this.roleService.edit(r.id, name).subscribe({
      next: () => {
        this.saving = false;
        this.cancelEdit();
        this.toast.success('تم تعديل الدور');
        this.load();
      },
      error: err => {
        this.saving = false;
        // the API answers 404 when the new name is already taken or the role no longer exists
        this.toast.error(err?.status === 404 ? 'تعذر التعديل: الاسم مستخدم بالفعل أو الدور غير موجود' : apiErrorMessage(err, 'تعذر تعديل الدور'));
      }
    });
  }

  async remove(r: IdentityRoleDTO): Promise<void> {
    const ok = await this.confirmService.ask({
      title: 'حذف الدور',
      message: `هل تريد حذف الدور "${r.name}"؟`,
      confirmText: 'حذف',
      tone: 'danger'
    });
    if (!ok) return;

    this.roleService.delete(r.id).subscribe({
      next: () => {
        this.toast.success('تم حذف الدور');
        this.load();
      },
      error: err => this.toast.error(apiErrorMessage(err, 'تعذر حذف الدور'))
    });
  }
}
