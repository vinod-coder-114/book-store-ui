import { Injectable, signal, computed, inject, effect, untracked } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { AuthSessionService } from './auth-session.service';
import { ToastService } from './toast-service';
import type { AdminBook } from '../pages/admin/admin.model';
import { environment } from '../../environments/environment.dev';
import { BookService } from './book.service';

export interface CartResponseItem {
  bookId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CartResponse {
  cartId: string;
  status: string;
  items: CartResponseItem[];
  totalUnits: number;
  distinctItemCount: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

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

  private readonly http = inject(HttpClient);
  private readonly bookService = inject(BookService);
  private readonly authSession = inject(AuthSessionService);
  private readonly toastService = inject(ToastService);
  private readonly serverSubtotal = signal<number | null>(null);
  private readonly isLoadingSignal = signal(false);
  readonly isLoading = this.isLoadingSignal.asReadonly();

  constructor() {
    // Load the cart whenever a user is logged in (fresh login or page refresh)
    // and clear it when the session ends.
    effect(() => {
      if (this.authSession.isAuthenticated()) {
        untracked(() => this.loadCart());
      } else {
        untracked(() => this.resetCartCountWhenLogout());
      }
    });
  }
  private readonly addItemUrl = `${environment.apiUrl}${environment.cart.addItemUrl}`;

  readonly cartItemCount = computed(() => {
    return this.cartItemsSignal().reduce((total, item) => total + item.quantity, 0) ?? 0;
  });

  readonly wishListCount = computed(() => {
    return this.wishListSignal().reduce((total, item) => total + item.quantity, 0) ?? 0;
  });

  readonly totals = computed<CartTotals>(() => {
    const localSubtotal = this.cartItemsSignal().reduce(
      (total, item) => total + this.getOriginalPrice(item.book) * item.quantity,
      0,
    );
    const discount = this.cartItemsSignal().reduce(
      (total, item) => total + this.getDiscountPerBook(item.book) * item.quantity,
      0,
    );
    const delivery = this.cartItemsSignal().length > 0 ? this.deliveryFee : 0;
    const serverSubtotal = this.serverSubtotal();

    // The server subtotal is built from the effective unit prices, so the discount is already
    // included in it; fall back to the local calculation until the server value is known.
    return serverSubtotal === null
      ? { subtotal: localSubtotal, discount, delivery, total: localSubtotal - discount + delivery }
      : { subtotal: serverSubtotal, discount, delivery, total: serverSubtotal + delivery };
  });

  // Checks local stock limits, without changing the cart.
  canAddToCart(book: AdminBook): boolean {
    const currentCartItem = this.cartItemsSignal().find((item) => item.book.id === book.id);
    return book.stock > 0 && !(currentCartItem && currentCartItem.quantity >= book.stock);
  }

  // Calls POST /api/carts/items (bearer token required) and, on success,
  // syncs the local cart with the quantity confirmed by the server.
  addToCart(book: AdminBook): Observable<CartResponse> {
    const headers = this.bookService.buildAuthHeaders();
    return this.http
      .post<CartResponse>(this.addItemUrl, { bookId: book.id, quantity: 1 }, { headers })
      .pipe(tap((cart) => this.applyServerCart(book, cart)));
  }

  // Updates the local item for the book using the server's confirmed quantity.
  private applyServerCart(book: AdminBook, cart: CartResponse): void {
    const serverItem = cart.items.find((item) => item.bookId === book.id);
    const quantity = serverItem?.quantity ?? 1;
    this.serverSubtotal.set(cart.subtotal);
    this.cartItemsSignal.update((items) =>
      items.some((item) => item.book.id === book.id)
        ? items.map((item) => (item.book.id === book.id ? { ...item, quantity } : item))
        : [...items, { book, quantity }],
    );
  }

  // Increases the quantity of a cart item by 1 and updates the server.
  increaseQuantity(bookId: string): Observable<CartResponse> {
    return this.updateCart(
      bookId,
      (this.cartItemsSignal().find((item) => item.book.id === bookId)?.quantity ?? 1) + 1,
    ).pipe(tap((response) => this.increaserOrDecreaseQuantity(bookId, response)));
  }

  // Decreases the quantity of a cart item by 1 and updates the server.
  decreaseQuantity(bookId: string): Observable<CartResponse> {
    const currentQuantity =
      this.cartItemsSignal().find((item) => item.book.id === bookId)?.quantity ?? 1;
    return this.updateCart(bookId, currentQuantity - 1).pipe(
      tap((response) => this.increaserOrDecreaseQuantity(bookId, response)),
    );
  }

  // Increases or decreases the quantity of a cart item by the specified change amount.
  private increaserOrDecreaseQuantity(bookId: string, response: CartResponse): void {
    const serverItem = response.items.find((item) => item.bookId === bookId);
    const quantity = serverItem?.quantity ?? 1;
    this.serverSubtotal.set(response.subtotal);
    this.cartItemsSignal.update((items) =>
      items.map((item) => (item.book.id === bookId ? { ...item, quantity } : item)),
    );
  }

  // Updates the quantity of a cart item on the server.
  updateCart(bookId: string, quantity: number): Observable<CartResponse> {
    const headers = this.bookService.buildAuthHeaders();
    return this.http.put<CartResponse>(
      `${environment.apiUrl + environment.cart.addItemUrl + `/${bookId}`}`,
      { quantity: quantity },
      { headers },
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

  resetCartCountWhenLogout(): void {
    this.cartItemsSignal.set([]);
    this.serverSubtotal.set(null);
  }

  resetWishListCountWhenLogout(): void {
    this.wishListSignal.set([]);
  }

  getCartItems(): CartItem[] {
    return this.cartItemsSignal();
  }

  // Loads the cart from GET /api/carts, fetches each book's details, and
  // publishes everything in one update so the UI never sees a half-built cart.
  loadCart(): void {
    this.isLoadingSignal.set(true);
    this.fetchCartItemsFromServer()
      .pipe(
        switchMap((response) => {
          if (response.items.length === 0) {
            return of({ response, items: [] as CartItem[] });
          }
          return forkJoin(
            response.items.map((item) =>
              this.bookService
                .getBookDetails(item.bookId)
                .pipe(map((book): CartItem => ({ book, quantity: item.quantity }))),
            ),
          ).pipe(map((items) => ({ response, items })));
        }),
      )
      .subscribe({
        next: ({ response, items }) => {
          this.cartItemsSignal.set(items);
          this.serverSubtotal.set(response.subtotal);
          this.isLoadingSignal.set(false);
        },
        error: (error) => {
          console.error('Failed to load cart', error);
          this.isLoadingSignal.set(false);
          this.toastService.show('We could not load your cart. Please try again.', 'error');
        },
      });
  }

  // Fetches the latest cart items from the server.
  private fetchCartItemsFromServer(): Observable<CartResponse> {
    const headers = this.bookService.buildAuthHeaders();
    return this.http.get<CartResponse>(`${environment.apiUrl + environment.cart.getItemsUrl}`, {
      headers,
    });
  }

  getWishListItems(): CartItem[] {
    return this.wishListSignal();
  }
}
