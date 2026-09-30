import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent {
  private confirmService = inject(ConfirmService);
  state$ = this.confirmService.state$;

  // focus the primary action as soon as the dialog appears
  @ViewChild('confirmBtn') set confirmBtn(el: ElementRef<HTMLButtonElement> | undefined) {
    if (el) setTimeout(() => el.nativeElement.focus(), 0);
  }

  answer(result: boolean): void {
    this.confirmService.answer(result);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.confirmService.answer(false);
  }
}
