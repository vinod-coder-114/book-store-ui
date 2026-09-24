import { CurrencyPipe } from '@angular/common';
import { Component, computed, input, signal, inject } from '@angular/core';
import { CartService } from '../../../services/cart-service';
import { Router } from '@angular/router';
import { AdminBook } from '../../../pages/admin/admin.model';
import { environment } from '../../../../environments/environment.dev';
import { AuthSessionService } from '../../../services/auth-session.service';

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
  
  protected readonly showingBackCover = signal(false);

  // protected readonly activeImage = computed(() =>
  //   this.showingBackCover() ? this.backImage() : this.frontImage(),
  // );

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
  }
}
