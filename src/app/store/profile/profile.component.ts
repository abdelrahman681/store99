import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);
  auth = inject(AuthService);

  loadingPassword = false;
  photoLoading = false;
  photoBroken = false;
  showCurrent = false;
  showNew = false;

  passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', Validators.required]
  });

  ngOnInit(): void {
    this.auth.getCurrentUser().subscribe({ error: () => {} });
  }

  // ---------- Profile photo ----------
  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toast.warning('من فضلك اختر ملف صورة');
      input.value = '';
      return;
    }

    this.photoLoading = true;

    this.auth.updateProfilePhoto(file).subscribe({
      next: () => {
        this.auth.getCurrentUser().subscribe({
          next: () => {
            this.photoLoading = false;
            this.photoBroken = false;
            this.toast.success('تم تحديث صورة الملف الشخصي');
          },
          error: () => (this.photoLoading = false)
        });
      },
      error: err => {
        this.photoLoading = false;
        this.toast.error(err?.error?.message || 'تعذر تحديث الصورة');
      }
    });

    input.value = '';
  }

  // ---------- Change password ----------
  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.toast.warning('من فضلك أدخل كلمة المرور الحالية والجديدة');
      return;
    }

    this.loadingPassword = true;

    this.auth.changePassword(this.passwordForm.getRawValue()).subscribe({
      next: () => {
        this.loadingPassword = false;
        this.toast.success('تم تغيير كلمة المرور بنجاح');
        this.passwordForm.reset();
      },
      error: err => {
        this.loadingPassword = false;
        this.toast.error(err?.error?.message || 'تعذر تغيير كلمة المرور');
      }
    });
  }

  // ---------- Delete account ----------
  async deleteAccount(): Promise<void> {
    const ok = await this.confirmService.ask({
      title: 'حذف الحساب',
      message: 'هل أنت متأكد أنك تريد حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء.',
      confirmText: 'نعم، احذف حسابي',
      tone: 'danger'
    });
    if (!ok) return;

    this.auth.deleteUser().subscribe({
      next: () => {
        this.auth.clearSession();
        this.toast.success('تم حذف الحساب');
        this.router.navigate(['/auth/login']);
      },
      error: () => this.toast.error('تعذر حذف الحساب')
    });
  }

  // ---------- Helpers ----------
  getProfileImage(): string | null {
    const pictureUrl = this.auth.currentUser()?.pictureUrl;
    if (!pictureUrl || this.photoBroken) return null;
    return pictureUrl.replace(/\\/g, '/');
  }

  initial(): string {
    return (this.auth.currentUser()?.displayName ?? '?').trim().charAt(0).toUpperCase() || '?';
  }

  genderLabel(): string {
    const g = this.auth.currentUser()?.gender;
    return g === 'Male' ? 'ذكر' : g === 'Female' ? 'أنثى' : g || '—';
  }
}
