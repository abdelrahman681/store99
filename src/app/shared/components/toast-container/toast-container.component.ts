import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastService, ToastType } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html'
})
export class ToastContainerComponent {
  private toastService = inject(ToastService);
  toasts$ = this.toastService.toasts$;

  private icons: Record<ToastType, string> = {
    success: 'bi-check-lg',
    error: 'bi-x-lg',
    info: 'bi-info-lg',
    warning: 'bi-exclamation-lg'
  };

  icon(type: ToastType): string {
    return this.icons[type];
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
