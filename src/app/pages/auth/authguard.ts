import { CanActivateFn } from "@angular/router";
import { AuthSession, AuthSessionService } from "../../services/auth-session.service";
import { Router } from "@angular/router";
import { inject } from "@angular/core";

export const authGuard : CanActivateFn = () => {
  // Implement your authentication guard logic here
  const authService =  inject(AuthSessionService);
  const router: Router = inject(Router);
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']); // Redirect to the login page if not authenticated
    return false;
  }

  const isAuthenticated = authService.isAuthenticated(); // Replace with your actual authentication check
  return isAuthenticated;
};