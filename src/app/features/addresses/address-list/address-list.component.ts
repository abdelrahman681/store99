import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddressService } from '../../../core/services/address.service';
import { AddressDTO } from '../../../core/models/address.model';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './address-list.component.html'
})
export class AddressListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private addressService = inject(AddressService);
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);

  addresses: AddressDTO[] = [];
  loading = true;
  saving = false;
  editingId: number | null = null;

  form: FormGroup = this.fb.group({
    city: ['', Validators.required],
    street: ['', Validators.required],
    government: ['', Validators.required]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.addressService.getAllAddress().subscribe({
      next: list => {
        this.addresses = list;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('تعذر تحميل العناوين');
      }
    });
  }

  edit(a: AddressDTO): void {
    this.editingId = a.id ?? null;
    this.form.patchValue({ city: a.city, street: a.street, government: a.government });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.form.reset();
  }

  private errorText(err: any, fallback: string): string {
    const raw = err?.error?.message || err?.error?.Message || (typeof err?.error === 'string' ? err.error : '');
    return raw || fallback;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('من فضلك املأ كل بيانات العنوان');
      return;
    }

    const dto: AddressDTO = {
      id: this.editingId ?? undefined,
      city: this.form.controls['city'].value,
      street: this.form.controls['street'].value,
      government: this.form.controls['government'].value
    };

    this.saving = true;

    if (this.editingId !== null) {
      this.addressService.updateAddress(dto).subscribe({
        next: () => {
          this.saving = false;
          this.cancelEdit();
          this.load();
          this.toast.success('تم تعديل العنوان بنجاح');
        },
        error: err => {
          this.saving = false;
          this.toast.error(this.errorText(err, 'تعذر تعديل العنوان'));
        }
      });
    } else {
      this.addressService.addAddress(dto).subscribe({
        next: () => {
          this.saving = false;
          this.form.reset();
          this.load();
          this.toast.success('تمت إضافة العنوان بنجاح');
        },
        error: err => {
          this.saving = false;
          this.toast.error(this.errorText(err, 'تعذر إضافة العنوان'));
        }
      });
    }
  }

  async remove(a: AddressDTO): Promise<void> {
    if (a.id == null) return;

    const ok = await this.confirmService.ask({
      title: 'حذف العنوان',
      message: `هل تريد حذف العنوان "${a.street}، ${a.city}"؟`,
      confirmText: 'حذف',
      tone: 'danger'
    });
    if (!ok) return;

    this.addressService.deleteAddress(a.id).subscribe({
      next: () => {
        if (this.editingId === a.id) this.cancelEdit();
        this.load();
        this.toast.success('تم حذف العنوان');
      },
      error: err => this.toast.error(this.errorText(err, 'تعذر حذف العنوان'))
    });
  }
}
