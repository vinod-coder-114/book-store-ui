import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  styleUrl: './confirm-dialog.css',
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  readonly open = input(false);
  readonly title = input('Are you sure?');
  readonly confirmLabel = input('Confirm');
  readonly cancelLabel = input('Cancel');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected onConfirm(): void {
    this.confirmed.emit();
  }

  protected onCancel(): void {
    this.cancelled.emit();
  }
}
