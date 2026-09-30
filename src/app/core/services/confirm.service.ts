import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  tone?: 'danger' | 'primary';
  icon?: string;
}

export interface ConfirmState extends Required<ConfirmOptions> {
  resolve: (value: boolean) => void;
}

/** Styled replacement for window.confirm() — `await confirm.ask({...})` returns true/false. */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private stateSubject = new BehaviorSubject<ConfirmState | null>(null);
  state$ = this.stateSubject.asObservable();

  ask(options: ConfirmOptions): Promise<boolean> {
    // if one is already open, close it as "cancelled"
    this.stateSubject.value?.resolve(false);

    return new Promise<boolean>(resolve => {
      const tone = options.tone ?? 'primary';
      this.stateSubject.next({
        title: options.title ?? 'تأكيد',
        message: options.message,
        confirmText: options.confirmText ?? 'تأكيد',
        cancelText: options.cancelText ?? 'إلغاء',
        tone,
        icon: options.icon ?? (tone === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-question-circle-fill'),
        resolve
      });
    });
  }

  answer(result: boolean): void {
    const state = this.stateSubject.value;
    if (!state) return;
    this.stateSubject.next(null);
    state.resolve(result);
  }
}
