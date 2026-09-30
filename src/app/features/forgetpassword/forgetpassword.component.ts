import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './forgetpassword.component.html',
  styleUrl: './forgetpassword.component.css'
})
export class ForgetpasswordComponent {

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  loading = false;

  form = this.fb.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ]
  });

  submit(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const email = this.form.value.email!;

    this.auth.forgotPassword(email).subscribe({

      next: () => {

        this.loading = false;

        this.toast.success('تم إرسال كود التحقق إلى بريدك الإلكتروني ✉️');

        setTimeout(() => {
          this.router.navigate(
            ['/verify-otp'],
            {
              queryParams: { email }
            }
          );
        }, 1500);
      },

      error: (err) => {

        this.loading = false;

        try {

          const errorResponse =
            typeof err.error === 'string'
              ? JSON.parse(err.error)
              : err.error;

          this.toast.error(errorResponse?.message || 'حصل خطأ، حاول تاني.');

        } catch {

          this.toast.error('حصل خطأ، حاول تاني.');
        }
      }
    });
  }
}