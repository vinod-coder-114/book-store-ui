import { Component, inject, computed, signal } from '@angular/core';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { BookCardComponent } from '../../shared/components/book/book';
import type { AdminBook } from '../admin/admin.model';
import { environment } from '../../../environments/environment.dev';
import { toSignal } from '@angular/core/rxjs-interop';
import { BookService } from '../../services/book.service';

@Component({
  imports: [BookCardComponent],
  standalone: true,
  selector: 'app-catalog',
  styleUrl: './catalog.css',
  templateUrl: './catalog.html',
})
export class Catalog {
  private readonly bookService = inject(BookService);
  private readonly route = inject(ActivatedRoute);

  allBooks = toSignal(this.bookService.getBooksInformation(), { initialValue: [] });

  private readonly searchTerm = toSignal(
    this.route.queryParamMap.pipe(map((params) => (params.get('q') ?? '').toLowerCase())),
    { initialValue: '' },
  );

  books = computed(() => {
    const search = this.searchTerm();
    // const search = this.bookService.getSearchTerm();
    console.log(`Search query: ${search}`);

    if (!search) {
      return this.allBooks();
    }

    return this.allBooks().filter(
      (book) =>
        book.title.toLowerCase().includes(search) || book.author.toLowerCase().includes(search),
    );
  });

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
