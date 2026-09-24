import { CurrencyPipe } from '@angular/common';
import { Component, computed, input, signal, inject } from '@angular/core';
import { CartService } from '../../../services/cart-service';
import { Router } from '@angular/router';
import { AdminBook } from '../../../pages/admin/admin.model';
import { environment } from '../../../../environments/environment.dev';
import { AuthSessionService } from '../../../services/auth-session.service';
import { ToastService } from '../../../services/toast-service';

@Component({
  imports: [CurrencyPipe],
  selector: 'app-book',
  styleUrl: './book.css',
  templateUrl: './book.html',
})
export class BookCardComponent {
  book = input.required<AdminBook>();
  protected readonly environment = environment;
  protected readonly authService = inject(AuthSessionService);
  protected router = inject(Router);

  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);
  
  protected readonly showingBackCover = signal(false);

  //  notification system when user added the book to cart or whishlist
  protected readonly notificationMessage = signal<string | null>(null);
  private notificationTimer?: ReturnType<typeof setTimeout>;

  private showNotification(message:string):void {
    clearTimeout(this.notificationTimer);
    this.notificationMessage.set(message);

    this.notificationTimer = setTimeout(() =>{
      this.notificationMessage.set(null);
    }, 3000);
  }

  protected showFrontCover(): void {
    this.showingBackCover.set(false);
  }

  protected showBackCover(): void {
    this.showingBackCover.set(true);
  }

  addToCart(book: AdminBook): void {
    // Implement the logic to add the book to the cart
    console.log(`Adding book to cart: ${book.title}`);
    if (this.authService.isAuthenticated()) {
      // Add the book to the user's cart
      console.log(`Book added to cart: ${book.title}`);
      // You can add additional logic here if needed, such as updating the UI or notifying the user.
      this.cartService.addToCart(book);
      this.toastService.show(`"${book.title}" was added to your cart.`);
    } else {
      // Prompt the user to log in
      this.router.navigate(['/login']);
    }
  }

  addToWishList(): void {
    if(!this.authService.isAuthenticated()) {
        this.router.navigate(['/login']);
        return;
    } 
    this.cartService.addToWishList(this.book());
    this.toastService.show(`"${this.book().title}" was added to your wishlist`);
  }
}
