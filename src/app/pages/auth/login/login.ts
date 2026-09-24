import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { BookService } from '../../../services/book.service';
import { AuthSessionService, LoginResponse } from '../../../services/auth-session.service';
import { HttpErrorResponse } from '@angular/common/http';

type LoginForm = {
  email: string;
  password: string;
};

@Component({
  imports: [RouterLink, ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly submitted = signal(false);
  readonly isSubmitted = signal(false);
  readonly loginError = signal<string | null>(null);

  constructor(
    private readonly bookService: BookService,
    private readonly authSessionService: AuthSessionService,
  ) {}

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  // make the payload for login
  private makePayload(): LoginForm {
    const formValues = this.loginForm.getRawValue();
    return {
      email: formValues.email.trim(),
      password: formValues.password.trim(),
    };
  }

  onSubmit(): void {
    this.loginError.set(null);
    this.submitted.set(true);
    this.isSubmitted.set(true);
    if (this.loginForm.valid) {
      const payload = this.makePayload();
      this.bookService.login(payload).subscribe({
        next: (response: LoginResponse) => {
          const session = this.authSessionService.saveSession(response);
          const isAdmin = session.role === 'admin';
          console.log('Login successful', response);
          this.isSubmitted.set(false);
          void this.router.navigate([isAdmin ? '/admin/books' : '/books']);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Login failed', error);
          this.isSubmitted.set(false);
          this.loginError.set(this.getLoginErrorMessage(error));
        },
      });
    }
  }

  private getLoginErrorMessage(error: HttpErrorResponse): string {
    if (typeof error.error === 'object' && error.error !== null) {
      const response = error.error as { message?: unknown; error?: unknown };

      if (typeof response.message === 'string') {
        return response.message;
      }

      if (typeof response.error === 'string') {
        return response.error;
      }
    }

    if (typeof error.error === 'string') {
      return error.error;
    }

    if (error.status === 400 || error.status === 401) {
      return 'Incorrect email or password. Please try again.';
    }
    return 'We could not sign you in. Please try again later';
  }

  isInvalid(controlName: keyof typeof this.loginForm.controls): boolean {
    const control = this.loginForm.controls[controlName];
    return (this.submitted() || control.touched) && control.invalid;
  }
}
