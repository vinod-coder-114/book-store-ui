import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private nextId = 0;
  private readonly toastSignal = signal<Toast[]>([]);

  readonly toasts = this.toastSignal.asReadonly();

  show(message: string, type: ToastType = 'success', duration = 3500): void {
    const toast: Toast = {
      id: ++this.nextId,
      message,
      type,
    };

    this.toastSignal.update((toasts) => [...toasts, toast]);
    window.setTimeout(() => this.dismiss(toast.id), duration);
  }

  dismiss(toastId: number): void {
    this.toastSignal.update((toasts) => toasts.filter((toast) => toast.id !== toastId));
  }
}
