import { Component, inject} from '@angular/core';
import { BookCardComponent } from '../../shared/components/book/book';
import type { AdminBook } from '../admin/admin.model';
import { AdminService } from '../../services/admin.service';
import { environment } from '../../../environments/environment.dev';
import { toSignal } from '@angular/core/rxjs-interop';


@Component({
  imports: [BookCardComponent],
  standalone: true,
  selector: 'app-catalog',
  styleUrl: './catalog.css',
  templateUrl: './catalog.html',
})
export class Catalog {
  private readonly adminService: AdminService = inject(AdminService);

  books = toSignal(this.adminService.getBooksInformation(), { initialValue: [] });

  protected frontImageUrl(book: AdminBook): string {
    return this.toAbsoluteUrl(book.images?.find((image) => image.primary)?.downloadUrl);
  }

  protected backImageUrl(book: AdminBook): string {
    return this.toAbsoluteUrl(book.images?.find((image) => !image.primary)?.downloadUrl);
  }

  // Existing images are host-relative paths; falls back to an empty string when a cover is missing
  private toAbsoluteUrl(url: string | null | undefined): string {
    if (!url) {
      return '';
    }
    return url.startsWith('data:') || url.startsWith('http') ? url : `${environment.hostUrl + url}`;
  }
}
