import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  private readonly router = inject(Router);

  readonly cartCount = input(0);
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
    const search = this.searchQuery().trim();
    this.closeMenu();
    this.closeUserMenu();
    void this.router.navigate(['/books'], {
      queryParams: search ? { q: search } : {},
    });
  }

  protected logout(): void {
    this.closeMenu();
    this.closeUserMenu();
    this.loggedOut.emit();
  }
}
