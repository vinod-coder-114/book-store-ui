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
    private readonly addBookApi = `${environment.apiUrl + environment.catalog.listBooksUrl}`;

  constructor(
    private http: HttpClient,
    private authSessionService: AuthSessionService,
  ) {}

  getBooksInformation() {
    const headers = this.buildAuthHeaders();
    const responseData = this.http.get<AdminBook[]>(this.getBooksApi, { headers });
    console.log(responseData.subscribe(data => console.log(data)));
    return responseData;
  }

  // book is sent as a JSON part and images as multipart file parts
  addBook(book: Omit<AdminBook, 'id' | 'images'>, images: File[]) {
    const headers = this.buildAuthHeaders();
    const formData = new FormData();
    formData.append('book', new Blob([JSON.stringify(book)], { type: 'application/json' }));
    images.forEach((image) => formData.append('images', image, image.name));
    return this.http.post<AdminBook>(this.addBookApi, formData, { headers });
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