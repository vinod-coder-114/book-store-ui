import { Component, inject } from '@angular/core';
import { ToastService } from '../../../services/toast-service';

@Component({
  imports: [],
  selector: 'app-toaster',
  styleUrl: './toaster.css',
  templateUrl: './toaster.html',
})
export class Toaster {
  protected readonly toasterService = inject(ToastService);

  protected dismiss(toastId:number): void {
    this.toasterService.dismiss(toastId);
  }
}
