import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AdminUser, RoleSelection, adminUserId, adminUserRoles } from '../../../core/models/user-admin.model';
import { IdentityRoleDTO } from '../../../core/models/role.model';
import { RoleService } from '../../../core/services/role.service';
import { UserAdminService } from '../../../core/services/user-admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { apiErrorMessage } from '../../../core/utils/api-error';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent],
  templateUrl: './users-management.component.html'
})
export class UsersManagementComponent implements OnInit {
  private userAdmin = inject(UserAdminService);
  private roleService = inject(RoleService);
  private toast = inject(ToastService);
  private store = inject(Store);

  users: AdminUser[] = [];
  roles: IdentityRoleDTO[] = [];
  loading = true;

  search = '';
  page = 1;
  readonly pageSize = 8;

  myEmail = '';

  editing: AdminUser | null = null;
  selected = new Set<string>();
  private initial = new Set<string>();
  saving = false;

  userRoles = adminUserRoles;

  ngOnInit(): void {
    this.store.select(selectCurrentUser).subscribe(u => (this.myEmail = (u?.email ?? '').toLowerCase()));
    this.load();
    this.roleService.getAll().subscribe({
      next: roles => (this.roles = roles ?? []),
      error: err => this.toast.error(apiErrorMessage(err, 'تعذر تحميل الأدوار'))
    });
  }

  load(): void {
    this.loading = true;
    this.userAdmin.getUsers().subscribe({
      next: users => {
        this.users = users;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.toast.error(
          err?.status === 415
            ? 'تعذر تحميل المستخدمين (415): غيّر باراميتر الـ action في الـ API إلى [FromQuery]'
            : apiErrorMessage(err, 'تعذر تحميل المستخدمين')
        );
      }
    });
  }

  // ---------- list ----------
  /** true when the API rows carry no user id → editing is impossible until the backend returns it */
  get missingIds(): boolean {
    return this.users.length > 0 && this.users.every(u => !adminUserId(u));
  }

  get filtered(): AdminUser[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.users;
    return this.users.filter(u => `${u.displayName} ${u.email}`.toLowerCase().includes(q));
  }

  get totalPages(): number {
    return Math.ceil(this.filtered.length / this.pageSize);
  }

  get pageUsers(): AdminUser[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  onSearch(): void {
    this.page = 1;
  }

  goTo(page: number): void {
    this.page = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  photo(u: AdminUser): string | null {
    return u.pictureUrl ? u.pictureUrl.replace(/\\/g, '/') : null;
  }

  initialOf(u: AdminUser): string {
    return (u.displayName ?? '?').trim().charAt(0).toUpperCase() || '?';
  }

  isMe(u: AdminUser): boolean {
    return !!this.myEmail && u.email?.toLowerCase() === this.myEmail;
  }

  // ---------- edit ----------
  startEdit(u: AdminUser): void {
    if (!adminUserId(u)) {
      this.toast.error('الـ API مش بيرجّع Id المستخدم — أضف Id في الـ DTO الأول');
      return;
    }
    this.editing = u;
    this.initial = new Set(adminUserRoles(u).map(r => r.toLowerCase()));
    this.selected = new Set(this.initial);
    setTimeout(() => document.getElementById('user-edit')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  cancelEdit(): void {
    this.editing = null;
  }

  isChecked(role: IdentityRoleDTO): boolean {
    return this.selected.has(role.name.toLowerCase());
  }

  /** an admin must not be able to remove their own Admin role (they would lock themselves out) */
  isLocked(role: IdentityRoleDTO): boolean {
    return !!this.editing && this.isMe(this.editing) && role.name.toLowerCase() === 'admin';
  }

  toggle(role: IdentityRoleDTO, checked: boolean): void {
    const key = role.name.toLowerCase();
    if (checked) this.selected.add(key); else this.selected.delete(key);
  }

  /**
   * Only the roles whose state CHANGED are sent. The list endpoint returns just the first role of each
   * user, so sending every role would accidentally remove roles the screen doesn't know about.
   */
  get changes(): RoleSelection[] {
    return this.roles
      .filter(r => this.selected.has(r.name.toLowerCase()) !== this.initial.has(r.name.toLowerCase()))
      .map(r => ({ name: r.name, isSelected: this.selected.has(r.name.toLowerCase()) }));
  }

  save(): void {
    const user = this.editing;
    const userId = user ? adminUserId(user) : null;
    if (!user || !userId) return;

    const roles = this.changes;
    if (roles.length === 0) {
      this.toast.info('لم يتم تغيير أي دور');
      return;
    }

    this.saving = true;
    this.userAdmin.updateRoles({ userId, roles }).subscribe({
      next: () => {
        this.saving = false;
        this.editing = null;
        this.toast.success('تم تحديث أدوار المستخدم ✅');
        this.load();
      },
      error: err => {
        this.saving = false;
        this.toast.error(
          err?.status === 404 ? 'المستخدم غير موجود' : apiErrorMessage(err, 'تعذر تحديث الأدوار')
        );
      }
    });
  }
}
