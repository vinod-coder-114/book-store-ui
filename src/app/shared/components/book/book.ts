import { CurrencyPipe } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';

@Component({
  imports: [CurrencyPipe],
  selector: 'app-book',
  styleUrl: './book.css',
  templateUrl: './book.html',
})
export class BookCardComponent {
  readonly title = input.required<string>();
  readonly author = input.required<string>();
  readonly frontImage = input.required<string>();
  readonly backImage = input.required<string>();
  readonly price = input.required<number>();
  readonly originalPrice = input<number | null>(null);
  readonly genre = input('General');
  readonly format = input('Paperback');
  readonly rating = input<number | null>(null);

  protected readonly showingBackCover = signal(false);
  protected readonly activeImage = computed(() =>
    this.showingBackCover() ? this.backImage() : this.frontImage(),
  );

  protected showFrontCover(): void {
    this.showingBackCover.set(false);
  }

  protected showBackCover(): void {
    this.showingBackCover.set(true);
  }
}
