import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './resetpassword.component.html',
  styleUrl: './resetpassword.component.css'
})
export class ResetpasswordComponent implements OnInit {

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  showPassword = false;
  email = '';

  loading = false;



  form = this.fb.group({
    newPassword: [
      '',
      [
        Validators.required,
        Validators.minLength(6)
      ]
    ]
  });

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.email = params['email'] || '';

      if (!this.email) {
        this.router.navigate(['/forgot-password']);
      }

    });

  }

  submit(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }

    this.loading = true;

    const dto = {
      email: this.email,
      newPassword: this.form.value.newPassword!
    };

    this.auth.resetPassword(dto).subscribe({

      next: () => {

        this.loading = false;

        this.toast.success('تم تغيير كلمة المرور بنجاح ✅');

        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1500);

      },

      error: (err) => {

        this.loading = false;

        this.toast.error(this.getErrorMessage(err));

      }

    });

  }

  private getErrorMessage(err: any): string {

    if (typeof err?.error === 'string') {

      try {

        const parsed = JSON.parse(err.error);

        return parsed?.message || err.error;

      } catch {

        return err.error;

      }

    }

    return (
      err?.error?.message ||
      err?.message ||
      'حصل خطأ، حاول تاني.'
    );

  }

}

