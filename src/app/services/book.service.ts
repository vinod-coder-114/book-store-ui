import { Injectable, signal } from '@angular/core';
import { ToastService } from './toast-service';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.dev';
import { LoginResponse } from './auth-session.service';
import { AuthSessionService } from './auth-session.service';
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

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private authSessionService: AuthSessionService,
  ) {}
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

  // Method to build the authorization headers for HTTP requests
  buildAuthHeaders(): HttpHeaders {
    const token = this.authSessionService.getSession()?.token ?? '';
    return new HttpHeaders({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-Correlation-Id': crypto.randomUUID(),
    });
  }

  // get book details by ID
  getBookDetails(bookId: string): Observable<AdminBook> {
    const headers = this.buildAuthHeaders();
    return this.http.get<AdminBook>(
      `${environment.apiUrl + environment.catalog.bookDetailsUrl(bookId)}`,
      {
        headers,
      },
    );
  }
}
