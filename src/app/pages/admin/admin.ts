import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { AdminBook, BookImage } from './admin.model';
import { environment } from '../../../environments/environment.dev';

@Component({
  imports: [ReactiveFormsModule, CurrencyPipe],
  selector: 'app-admin',
  styleUrl: './admin.css',
  templateUrl: './admin.html',
})
export class Admin {
  private readonly fb = new FormBuilder();
  private readonly environment = environment;

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
    this.frontImagePreview.set(book.images?.find((image) => image.primary)?.downloadUrl ?? null);
    this.backImagePreview.set(book.images?.find((image) => !image.primary)?.downloadUrl ?? null);
    this.showForm.set(true);
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
      this.books.update((books) =>
        books.map((book) => (book.id === editingId ? { ...book, ...values, images } : book)),
      );
      this.cancelForm();
      return;
    }

    const images = [this.frontImageFile, this.backImageFile].filter(
      (file): file is File => file !== null,
    );

    this.adminService.addBook(values, images).subscribe((book) => {
      this.books.update((books) => [...books, book]);
      this.cancelForm();
    });
  }

  protected deleteBook(id: string): void {
    if (!confirm('Delete this book?')) {
      return;
    }
    this.books.update((books) => books.filter((book) => book.id !== id));
  }

  protected updateStock(id: string, stock: number): void {
    const safeStock = Math.max(0, stock);
    this.books.update((books) =>
      books.map((book) => (book.id === id ? { ...book, stock: safeStock } : book)),
    );
  }

  protected primaryImageUrl(images: BookImage[]): string | null {
    const imageUrl = images?.find((image) => image.primary)?.downloadUrl ?? null;
    if (!imageUrl) {
      return null;
    }
    return `${this.environment.hostUrl + imageUrl}`;
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

