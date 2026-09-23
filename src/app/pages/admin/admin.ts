import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { AdminBook, BookImage } from './admin.model';
import { environment } from '../../../environments/environment.dev';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  imports: [ReactiveFormsModule, CurrencyPipe, ConfirmDialog],
  selector: 'app-admin',
  styleUrl: './admin.css',
  templateUrl: './admin.html',
})
export class Admin {
  private readonly fb = new FormBuilder();
  private readonly environment = environment;
  @ViewChild('bookFormSection') private formSection?: ElementRef<HTMLElement>;

  protected readonly books = signal<AdminBook[]>([]);
  constructor(private adminService: AdminService) {
    this.adminService.getBooksInformation().subscribe((books) => {
      this.books.set(books);
    });
  }

  protected readonly editingId = signal<string | null>(null);
  protected readonly showForm = signal(false);
  protected readonly existingImages = signal<BookImage[]>([]);
  protected readonly frontImagePreview = signal<string | null>(null);
  protected readonly backImagePreview = signal<string | null>(null);
  private frontImageFile: File | null = null;
  private backImageFile: File | null = null;

  protected readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    author: ['', Validators.required],
    genre: ['', Validators.required],
    format: ['Paperback', Validators.required],
    pricing: this.fb.nonNullable.group({
      currency: ['INR', Validators.required],
      salePrice: [0, [Validators.required, Validators.min(0)]],
      listPrice: [0, [Validators.required, Validators.min(0)]],
    }),
    rating: this.fb.nonNullable.group({
      average: [0, [Validators.required, Validators.min(0), Validators.max(5)]],
      count: [0, [Validators.required, Validators.min(0)]],
    }),
    stock: [0, [Validators.required, Validators.min(0)]],
  });

  protected openAddForm(): void {
    this.editingId.set(null);
    this.form.reset({
      title: '',
      author: '',
      genre: '',
      format: 'Paperback',
      pricing: { currency: 'INR', salePrice: 0, listPrice: 0 },
      rating: { average: 0, count: 0 },
      stock: 0,
    });
    this.existingImages.set([]);
    this.frontImageFile = null;
    this.backImageFile = null;
    this.frontImagePreview.set(null);
    this.backImagePreview.set(null);
    this.showForm.set(true);
    this.scrollToForm();
  }

  protected openEditForm(book: AdminBook): void {
    this.editingId.set(book.id);
    this.form.reset({
      title: book.title,
      author: book.author,
      genre: book.genre,
      format: book.format,
      pricing: book.pricing,
      rating: book.rating,
      stock: book.stock,
    });
    this.existingImages.set(book.images ?? []);
    this.frontImageFile = null;
    this.backImageFile = null;
    this.frontImagePreview.set(this.toAbsoluteUrl(book.images?.find((image) => image.primary)?.downloadUrl));
    this.backImagePreview.set(this.toAbsoluteUrl(book.images?.find((image) => !image.primary)?.downloadUrl));
    this.showForm.set(true);
    this.scrollToForm();
  }

  // Existing images are host-relative paths; new uploads are already data URLs
  private toAbsoluteUrl(url: string | null | undefined): string | null {
    if (!url) {
      return null;
    }
    return url.startsWith('data:') || url.startsWith('http') ? url : `${this.environment.hostUrl + url}`;
  }

  protected cancelForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.existingImages.set([]);
    this.frontImageFile = null;
    this.backImageFile = null;
    this.frontImagePreview.set(null);
    this.backImagePreview.set(null);
  }

  protected onFrontImageSelected(event: Event): void {
    this.readImageFile(event, this.frontImagePreview, (file) => (this.frontImageFile = file));
  }

  protected onBackImageSelected(event: Event): void {
    this.readImageFile(event, this.backImagePreview, (file) => (this.backImageFile = file));
  }

  protected saveBook(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const editingId = this.editingId();

    if (editingId !== null) {
      const images = this.buildImages();
      this.adminService
        .updateBook(editingId, values, this.frontImageFile, this.backImageFile)
        .subscribe(() => {
          this.books.update((books) =>
            books.map((book) => (book.id === editingId ? { ...book, ...values, images } : book)),
          );
          this.cancelForm();
        });
      return;
    }

    const images = [this.frontImageFile, this.backImageFile].filter(
      (file): file is File => file !== null,
    );

    this.adminService.addBook(values, images).subscribe({
      next: (book) => {
        this.books.update((books) => [...books, book]);
        this.cancelForm();
      },
      error: (error) => {
        console.error('Add book failed', error);
        alert('Add book failed! ' + error.message);
      }
    });
  }

  protected readonly bookPendingDelete = signal<AdminBook | null>(null);

  protected requestDelete(book: AdminBook): void {
    this.bookPendingDelete.set(book);
  }

  protected cancelDelete(): void {
    this.bookPendingDelete.set(null);
  }

  protected confirmDelete(): void {
    const book = this.bookPendingDelete();
    if (!book) {
      return;
    }
    this.adminService.deleteBook(book.id).subscribe({
      next: () => {
        this.books.update((books) => books.filter((b) => b.id !== book.id));
        this.bookPendingDelete.set(null);
      },
      // capture and handle errors during delete operation
      error: (error) => {
        console.error('Delete failed', error);
        alert('Delete failed! '+ error.message);
      }
    });
  }

  protected updateStock(id: string, stock: number): void {
    const safeStock = Math.max(0, stock);
    this.books.update((books) =>
      books.map((book) => (book.id === id ? { ...book, stock: safeStock } : book)),
    );
  }

  // Waits a tick so the @if-rendered form section exists before scrolling to it
  private scrollToForm(): void {
    setTimeout(() => this.formSection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  protected primaryImageUrl(images: BookImage[]): string | null {
    return this.toAbsoluteUrl(images?.find((image) => image.primary)?.downloadUrl);
  }

  // Builds the images[] contract entry for front (primary) and back covers, reusing metadata for unchanged files
  private buildImages(): BookImage[] {
    const now = new Date().toISOString();
    const existing = this.existingImages();
    const primaryExisting = existing.find((image) => image.primary) ?? null;
    const secondaryExisting = existing.find((image) => !image.primary) ?? null;

    const images: BookImage[] = [];

    if (this.frontImageFile) {
      images.push({
        id: primaryExisting?.id ?? crypto.randomUUID(),
        downloadUrl: this.frontImagePreview() ?? '',
        fileName: this.frontImageFile.name,
        contentType: this.frontImageFile.type,
        sizeBytes: this.frontImageFile.size,
        displayOrder: 0,
        primary: true,
        createdAt: primaryExisting?.createdAt ?? now,
        updatedAt: now,
      });
    } else if (primaryExisting) {
      images.push(primaryExisting);
    }

    if (this.backImageFile) {
      images.push({
        id: secondaryExisting?.id ?? crypto.randomUUID(),
        downloadUrl: this.backImagePreview() ?? '',
        fileName: this.backImageFile.name,
        contentType: this.backImageFile.type,
        sizeBytes: this.backImageFile.size,
        displayOrder: 1,
        primary: false,
        createdAt: secondaryExisting?.createdAt ?? now,
        updatedAt: now,
      });
    } else if (secondaryExisting) {
      images.push(secondaryExisting);
    }

    return images;
  }

  // Cover images are previewed as data URLs until the media upload endpoint exists
  private readImageFile(
    event: Event,
    preview: typeof this.frontImagePreview,
    onFile: (file: File) => void,
  ): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    onFile(file);
    const reader = new FileReader();
    reader.onload = () => preview.set(reader.result as string);
    reader.readAsDataURL(file);
  }
}

