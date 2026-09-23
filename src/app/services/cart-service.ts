import { Injectable, signal, computed } from '@angular/core';
import type { AdminBook } from '../pages/admin/admin.model';

export interface CartItem {
  book: AdminBook;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly cartItemsSignal = signal<CartItem[]>([]);

  readonly cartItems = this.cartItemsSignal.asReadonly();
  
  readonly cartItemCount = computed(() => {
    return this.cartItemsSignal().reduce((total, item) => total + item.quantity, 0) ?? 0;
  });

  addToCart(book: AdminBook): void {    
    this.cartItemsSignal.update((items) => {
      const currentCartItem = items?.find((item) => item.book.id === book.id);
      if (currentCartItem) {
        return items?.map((item) =>
          item.book.id === book.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }
      return [
        ...items,
        {
          book,
          quantity: 1,
        },
      ];
    });
  }
}
