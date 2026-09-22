import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment.dev";
import { AdminBook } from "../pages/admin/admin.model";
import { AuthSessionService } from "./auth-session.service";

@Injectable({
  providedIn: 'root'
})
export class AdminService {
    private readonly getBooksApi = `${environment.apiUrl + environment.catalog.listBooksUrl}`;

  constructor(
    private http: HttpClient,
    private authSessionService: AuthSessionService,
  ) {}

  getBooksInformation() {
    const headers = this.buildAuthHeaders();
    return this.http.get<AdminBook[]>(this.getBooksApi, { headers });
  }

  // Attaches the Bearer token for every admin request (login/register don't need it)
  private buildAuthHeaders(): HttpHeaders {
    const token = this.authSessionService.getSession()?.token ?? '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'X-Correlation-Id': crypto.randomUUID(),
    });
  }
}