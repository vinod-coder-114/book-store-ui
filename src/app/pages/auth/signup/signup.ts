import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BookService } from '../../../services/book.service';

type SignupPayload = {
  first_name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  secondary_mobile_number?: string;
  gender: string;
  password: string;
  confirm_password: string;
  terms: boolean;
};

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-signup',
  styleUrl: './signup.css',
  templateUrl: './signup.html',
})
export class Signup {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly submitted = signal(false);
  readonly submitError = signal('');
  readonly submitSuccess = signal('');
  readonly isSubmitting = signal(false);
  constructor(private readonly bookService: BookService) {}

  readonly signupForm = this.fb.nonNullable.group(
    {
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      mobile_number: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      secondary_mobile_number: [''],
      gender: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', [Validators.required, Validators.minLength(8)]],
      terms: [false, [Validators.requiredTrue]],
    },
    { validators: [Signup.passwordsMatchValidator] },
  );

  static passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirm_password')?.value;
    if (!password || !confirmPassword) {
      return null;
    }
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  isInvalid(controlName: keyof typeof this.signupForm.controls): boolean {
    const control = this.signupForm.controls[controlName];
    return (this.submitted() || control.touched) && control.invalid;
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.submitError.set('');
    this.submitSuccess.set('');
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);

    const payload = this.toPayload();
    void this.callSignupApi(payload);
  }

  private toPayload(): SignupPayload {
    const formValue = this.signupForm.getRawValue();
    return {
      first_name: formValue.first_name.trim(),
      last_name: formValue.last_name.trim(),
      email: formValue.email.trim().toLowerCase(),
      mobile_number: formValue.mobile_number.trim(),
      secondary_mobile_number: formValue.secondary_mobile_number.trim(),
      gender: formValue.gender,
      password: formValue.password,
      confirm_password: formValue.confirm_password,
      terms: formValue.terms,
    };
  }

  private async callSignupApi(payload: SignupPayload): Promise<void> {
    try {
      await firstValueFrom(this.bookService.registerUser(payload));
      
      this.submitSuccess.set('Account created successfully.');
      this.signupForm.reset({
        first_name: '',
        last_name: '',
        email: '',
        mobile_number: '',
        secondary_mobile_number: '',
        gender: '',
        password: '',
        confirm_password: '',
        terms: false,
      });
      this.submitted.set(false);
      await this.router.navigate(['/login']);
    } catch {
      this.submitError.set('Signup failed. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
