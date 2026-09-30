import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { BookService } from '../../services/book.service';
import { CartService } from '../../services/cart-service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment.dev';

@Component({
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive, FormsModule],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  searchText = "";
  

  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  private readonly bookService = inject(BookService);
  

  readonly isLoggedIn = input(false);
  readonly userName = input('Guest');
  readonly userRole = input<'customer' | 'admin'>('customer');
  readonly loggedOut = output<void>();

  protected readonly menuOpen = signal(false);
  protected readonly userMenuOpen = signal(false);
  protected readonly searchQuery = signal('');
  protected readonly canAccessAdmin = computed(
    () => this.isLoggedIn() && this.userRole() === 'admin'
  );

  protected toggleMenu(): void {
    this.menuOpen.update((isOpen) => !isOpen);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.userMenuOpen.update((isOpen) => !isOpen);
  }

  protected closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  protected onSearchInput(value: string): void {
    this.searchQuery.set(value);
  }

  protected onSearchSubmit(event: Event): void {
    event.preventDefault();
    const search = this.searchText.trim();
    console.log(`Search query submitted: ${search}`);
    this.closeMenu();
    this.closeUserMenu();
    
    if(environment.enableBookSearchUsingQueryParam) {
      void this.router.navigate(['/books'], {
        queryParams: search ? { q: search } : {},
      });
    } else {
      this.bookService.setSearchTerm(search);
    }
  }

  protected logout(): void {
    this.closeMenu();
    this.closeUserMenu();
    this.loggedOut.emit();
  }

  //  cart count update
  readonly cartCount = this.cartService.cartItemCount;

  //  wishlist count update
  readonly wishlistCount = this.cartService.wishListCount;
}
