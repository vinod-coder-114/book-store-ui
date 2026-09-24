import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment.dev';
import type { CartItem } from '../../services/cart-service';
import { CartService } from '../../services/cart-service';

@Component({
  imports: [CurrencyPipe, RouterLink],
  selector: 'app-cart',
  styleUrl: './cart.css',
  templateUrl: './cart.html',
})
export class Cart {
  private readonly cartService = inject(CartService);

  protected readonly cartItems = this.cartService.cartItems;
  protected readonly totals = this.cartService.totals;
  protected readonly environment = environment;

  protected increaseQuantity(item: CartItem): void {
    this.cartService.increaseQuantity(item.book.id);
  }

  protected decreaseQuantity(item: CartItem): void {
    this.cartService.decreaseQuantity(item.book.id);
  }

  protected removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.book.id);
  }

  protected unitPrice(item: CartItem): number {
    return this.cartService.getUnitPrice(item.book);
  }

  protected originalPrice(item: CartItem): number {
    return this.cartService.getOriginalPrice(item.book);
  }

  protected coverUrl(item: CartItem): string | null {
    const cover = item.book.images.find((image) => image.primary) ?? item.book.images[0];
    return cover ? `${this.environment.hostUrl}${cover.downloadUrl}` : null;
  }
}
