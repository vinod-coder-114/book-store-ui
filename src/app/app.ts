import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AppFooter } from './components/footer/footer';
import { Header } from './components/header/header';
import { AuthSessionService, UserRole } from './services/auth-session.service';
import { BookService } from './services/book.service';

@Component({
  imports: [Header, AppFooter, RouterOutlet],
  selector: 'app-root',
  styleUrls: ['./app.css'],
  templateUrl: './app.html',
})
export class App {
  cartCount = 0;
  constructor(
    private readonly authSessionService: AuthSessionService,
    private readonly bookService: BookService,
    private readonly router: Router,
  ) {}

  get isLoggedIn(): boolean {
    return this.authSessionService.session() !== null;
  }

  get userName(): string {
    return this.authSessionService.session()?.name ?? 'Guest';
  }

  get userRole(): UserRole {
    return this.authSessionService.session()?.role ?? 'customer';
  }

  onLogout(): void {
    const token = this.authSessionService.session()?.token;
    if (!token) {
      this.completeLogout();
      return;
    }

    this.bookService.logout(token).subscribe({
      next: () => {
        this.completeLogout();
      },
      error: (error) => {
        console.error('Logout failed', error);
        this.completeLogout();
      },
    });
  }

  private completeLogout(): void {
    this.authSessionService.clearSession();
    void this.router.navigate(['/']);
  }
}
