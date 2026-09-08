import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { BookService } from '../../../services/book.service';
import { AuthSessionService, LoginResponse } from '../../../services/auth-session.service';

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
          void this.router.navigate([isAdmin ? '/account' : '/books']);
        },
        error: (error) => {
          console.error('Login failed', error);
          this.isSubmitted.set(false);
        },
      });
    }
  }

  isInvalid(controlName: keyof typeof this.loginForm.controls): boolean {
    const control = this.loginForm.controls[controlName];
    return (this.submitted() || control.touched) && control.invalid;
  }
}
