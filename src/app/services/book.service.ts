import { Injectable, signal } from '@angular/core';
import { ToastService } from './toast-service';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment.dev';
import { LoginResponse } from './auth-session.service';
import { AdminBook } from '../pages/admin/admin.model';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private readonly loginUrl = `${environment.apiUrl + environment.auth.loginUrl}`;
  private readonly signupUrl = `${environment.apiUrl + environment.auth.signupUrl}`;
  private readonly logoutUrl = `${environment.apiUrl + environment.auth.logoutUrl}`;

  private readonly getBooksApi = `${environment.apiUrl + environment.catalog.listBooksUrl}`;
  
  private searchTerm = signal('');

  setSearchTerm(search: string) {
    this.searchTerm.set(search);
  }

  getSearchTerm() {
    return this.searchTerm();
  }


  constructor(private http: HttpClient, private toastService: ToastService) {}
  //   Method for user registration
  registerUser(userData: any) {
    return this.http.post(this.signupUrl, userData);
  }

  // Method for user login
  login(userData: any) {
    return this.http.post<LoginResponse>(this.loginUrl, userData);
  }

  // Method for user logout
  logout(token: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post(this.logoutUrl, {}, { headers });
  }

  // Method to get all the books information
  getBooksInformation() {
    const headers = this.buildAuthHeaders();
    const responseData = this.http.get<AdminBook[]>(this.getBooksApi, { headers });
    return responseData;
  }

  buildAuthHeaders() {
    const token = localStorage.getItem('authToken');
    if (token) {
      return new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
    }
    return new HttpHeaders();
  }
}
