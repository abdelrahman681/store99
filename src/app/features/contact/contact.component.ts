import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ContactService } from '../../core/services/contact.service';
import { ToastService } from '../../core/services/toast.service';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { take } from 'rxjs';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html'
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private contactService = inject(ContactService);
  private toastService = inject(ToastService);
  private store = inject(Store);

  submitting = false;

  form = this.fb.nonNullable.group({
    senderName: ['', Validators.required],
    senderEmail: ['', [Validators.required, Validators.email]],
    messages: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  constructor() {
    // Pre-fill the form if the user is already logged in.
    this.store.select(selectCurrentUser).pipe(take(1)).subscribe(user => {
      if (user) {
        this.form.patchValue({ senderName: user.displayName, senderEmail: user.email });
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.contactService.send(this.form.getRawValue()).subscribe({
      next: () => {
        this.submitting = false;
        this.toastService.show('تم إرسال رسالتك بنجاح، هنتواصل معاك قريب ✉️', 'success');
        this.form.patchValue({ messages: '' });
      },
      error: () => {
        this.submitting = false;
        this.toastService.show('حصل خطأ أثناء إرسال الرسالة، حاول تاني', 'error');
      }
    });
  }
}
