import { Injectable, signal, computed, inject } from '@angular/core';
import type { AdminBook } from '../pages/admin/admin.model';
import { ToastService } from './toast-service';

export interface CartItem {
  book: AdminBook;
  quantity: number;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly deliveryFee = 50;
  private readonly cartItemsSignal = signal<CartItem[]>([]);
  private readonly wishListSignal = signal<CartItem[]>([]);

  readonly cartItems = this.cartItemsSignal.asReadonly();
  readonly wishListItems = this.wishListSignal.asReadonly();

  private readonly toastService = inject(ToastService);

  readonly cartItemCount = computed(() => {
    return this.cartItemsSignal().reduce((total, item) => total + item.quantity, 0) ?? 0;
  });

  readonly wishListCount = computed(() => {
    return this.wishListSignal().reduce((total, item) => total + item.quantity, 0) ?? 0;
  });

  readonly totals = computed<CartTotals>(() => {
    const subtotal = this.cartItemsSignal().reduce(
      (total, item) => total + this.getOriginalPrice(item.book) * item.quantity,
      0,
    );
    const discount = this.cartItemsSignal().reduce(
      (total, item) => total + this.getDiscountPerBook(item.book) * item.quantity,
      0,
    );
    const delivery = this.cartItemsSignal().length > 0 ? this.deliveryFee : 0;

    return { subtotal, discount, delivery, total: subtotal - discount + delivery };
  });

  addToCart(book: AdminBook): boolean {
    const currentCartItem = this.cartItemsSignal().find((item) => item.book.id === book.id);
    if (book.stock <= 0|| (currentCartItem && currentCartItem.quantity >= book.stock)) {
      return false;
    }
    
    this.cartItemsSignal.update((items) => {
      if (currentCartItem) {
        if (currentCartItem.quantity >= book.stock) {
          this.toastService.show(`"${currentCartItem.book.title}" exceeds available stock.`, 'error');
          return items;
        }

        return items.map((item) =>
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
    return true;
  }

  increaseQuantity(bookId: string): void {
    this.cartItemsSignal.update((items) =>
      items.map((item) =>
        item.book.id === bookId && item.quantity < item.book.stock
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  }

  decreaseQuantity(bookId: string): void {
    this.cartItemsSignal.update((items) =>
      items.map((item) =>
        item.book.id === bookId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    );
  }

  removeFromCart(bookId: string): void {
    this.cartItemsSignal.update((items) => items.filter((item) => item.book.id !== bookId));
  }

  getUnitPrice(book: AdminBook): number {
    const { listPrice, salePrice } = book.pricing;
    return salePrice > 0 && salePrice < listPrice ? salePrice : listPrice;
  }

  getOriginalPrice(book: AdminBook): number {
    return book.pricing.listPrice;
  }

  private getDiscountPerBook(book: AdminBook): number {
    return Math.max(0, this.getOriginalPrice(book) - this.getUnitPrice(book));
  }

  addToWishList(book: AdminBook): void {
    this.wishListSignal.update((items) => {
      const currentWishListItem = items?.find((item) => item.book.id === book.id);
      if (currentWishListItem) {
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

  resetCartCountWhenLogout() : void {
    this.cartItemsSignal.set([]);
  }

  resetWishListCountWhenLogout() : void {
    this.wishListSignal.set([]);
  }

  getCartItems(): CartItem[] {
    return this.cartItemsSignal();
  }
  
  getWishListItems(): CartItem[] {
    return this.wishListSignal();
  }
}
