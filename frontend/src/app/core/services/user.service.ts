import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserResponse, UserCreateRequest, UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiGatewayUrl}/api/users`;

  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.baseUrl);
  }

  getUsers(): Observable<UserResponse[]> {
    return this.getAllUsers();
  }

  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/${id}`);
  }

  getUserByUsername(username: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/username/${username}`);
  }

  getUsersByRole(role: UserRole): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.baseUrl}/role/${role}`);
  }

  getDoctorants(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.baseUrl}/role/DOCTORANT`);
  }

  getEncadreurs(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.baseUrl}/role/ENCADREUR`);
  }

  getPartenaires(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.baseUrl}/role/PARTENAIRE`);
  }

  createUser(req: UserCreateRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.baseUrl, req);
  }

  updateUser(id: number, req: Partial<UserCreateRequest>): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.baseUrl}/${id}`, req);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  toggleUserStatus(id: number): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.baseUrl}/${id}/toggle-status`, {});
  }
}
