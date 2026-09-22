import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly apiUrl =
    `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(
      this.apiUrl
    );
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/${id}`
    );
  }

  create(user: any): Observable<any> {
    return this.http.post<any>(
      this.apiUrl,
      user
    );
  }

  update(id: number, user: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${id}`,
      user
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/${id}`
    );
  }
}