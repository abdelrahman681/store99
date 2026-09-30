import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: number;
  text: string;
  type: ToastType;
  duration: number;
  leaving?: boolean;
}

const MAX_VISIBLE = 3;
const LEAVE_MS = 220;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private idCounter = 0;
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  show(text: string, type: ToastType = 'success', duration?: number): void {
    if (!text) return;

    // Same message already on screen → don't stack duplicates
    const current = this.toastsSubject.value;
    if (current.some(t => t.text === text && t.type === type && !t.leaving)) return;

    const id = ++this.idCounter;
    const ms = duration ?? (type === 'error' || type === 'warning' ? 4500 : 3200);

    // Keep the stack short, drop the oldest ones
    const next = [...current, { id, text, type, duration: ms }];
    const overflow = next.length - MAX_VISIBLE;
    this.toastsSubject.next(overflow > 0 ? next.slice(overflow) : next);

    setTimeout(() => this.dismiss(id), ms);
  }

  success(text: string, duration?: number): void { this.show(text, 'success', duration); }
  error(text: string, duration?: number): void { this.show(text, 'error', duration); }
  info(text: string, duration?: number): void { this.show(text, 'info', duration); }
  warning(text: string, duration?: number): void { this.show(text, 'warning', duration); }

  dismiss(id: number): void {
    const target = this.toastsSubject.value.find(t => t.id === id);
    if (!target || target.leaving) return;

    // play the exit animation, then remove
    this.toastsSubject.next(
      this.toastsSubject.value.map(t => (t.id === id ? { ...t, leaving: true } : t))
    );
    setTimeout(
      () => this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id)),
      LEAVE_MS
    );
  }
}
