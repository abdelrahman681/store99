import {
  Component,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './verify-otp.component.html',
  styleUrl: './verify-otp.component.css'
})
export class VerifyOtpComponent implements OnInit, OnDestroy {

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  email = '';

  loading = false;
  resendLoading = false;


  resendCountdown = 60;
  canResend = false;

  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  form = this.fb.group({
    otp: [
      '',
      [
        Validators.required,
        Validators.pattern(/^\d{6}$/)
      ]
    ]
  });

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.email = params['email'] || '';

      if (!this.email) {
        this.router.navigate(['/forgot-password']);
        return;
      }

      this.startResendCountdown();

    });

  }

  submit(): void {

    if (this.form.invalid || !this.email) {

      this.form.markAllAsTouched();

      return;
    }

    this.loading = true;

    const otp = this.form.value.otp!;

    this.auth.verifyOtp({
      email: this.email,
      otp: otp
    }).subscribe({

      next: () => {

        this.loading = false;

        this.toast.success('تم التحقق من الكود بنجاح ✅');

        setTimeout(() => {

          this.router.navigate(
            ['/reset-password'],
            {
              queryParams: {
                email: this.email
              }
            }
          );

        }, 1000);

      },

      error: (err: any) => {

        this.loading = false;

        this.toast.error(this.getErrorMessage(err));

      }

    });

  }

  resendOtp(): void {

    if (
      !this.email ||
      this.resendLoading ||
      !this.canResend
    ) {
      return;
    }

    this.resendLoading = true;

    this.auth.resendOtp(this.email).subscribe({

      next: () => {

        this.resendLoading = false;

        this.toast.success('تم إعادة إرسال الكود ✉️');

        this.startResendCountdown();

      },

      error: (err: any) => {

        this.resendLoading = false;

        this.toast.error(this.getErrorMessage(err));

      }

    });

  }

  private startResendCountdown(): void {

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.resendCountdown = 60;
    this.canResend = false;

    this.countdownInterval = setInterval(() => {

      this.resendCountdown--;

      if (this.resendCountdown <= 0) {

        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
        }

        this.countdownInterval = null;
        this.canResend = true;

      }

    }, 1000);

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

  ngOnDestroy(): void {

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

  }

}

