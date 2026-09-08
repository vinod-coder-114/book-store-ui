import { Service } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment.dev';
import { LoginResponse } from './auth-session.service';

@Injectable({
  providedIn: 'root'
})
export class BookService {
    private readonly loginUrl = `${environment.apiUrl+environment.auth.loginUrl }`;
    private readonly signupUrl = `${environment.apiUrl+environment.auth.signupUrl }`;
  private readonly logoutUrl = `${environment.apiUrl+environment.auth.logoutUrl }`;
  constructor(private http: HttpClient) {}
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
  
}
