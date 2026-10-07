import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  UserStats,
  CreateUserRequest,
  UpdateUserRequest,
  UserRole,
  UserStatus,
} from '../models/user.model';

export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  delay?: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<User> {
    return this.http
      .get<{ success: boolean; user: User }>(`${this.apiUrl}/me`)
      .pipe(map((res) => res.user));
  }

  getUsers(filters: UserFilters = {}): Observable<User[]> {
    let params = new HttpParams();
    if (filters.role) params = params.set('role', filters.role);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.delay !== undefined)
      params = params.set('delay', filters.delay.toString());

    return this.http
      .get<{ success: boolean; users: User[] }>(this.apiUrl, { params })
      .pipe(map((res) => res.users));
  }

  getUserById(id: string): Observable<User> {
    return this.http
      .get<{ success: boolean; user: User }>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.user));
  }

  createUser(payload: CreateUserRequest): Observable<User> {
    return this.http
      .post<{ success: boolean; user: User }>(this.apiUrl, payload)
      .pipe(map((res) => res.user));
  }

  updateUser(id: string, payload: UpdateUserRequest): Observable<User> {
    return this.http
      .put<{ success: boolean; user: User }>(`${this.apiUrl}/${id}`, payload)
      .pipe(map((res) => res.user));
  }

  updateUserStatus(id: string, status: UserStatus): Observable<User> {
    return this.http
      .patch<{ success: boolean; user: User }>(`${this.apiUrl}/${id}/status`, {
        status,
      })
      .pipe(map((res) => res.user));
  }

  deleteUser(id: string): Observable<void> {
    return this.http
      .delete<{ success: boolean }>(`${this.apiUrl}/${id}`)
      .pipe(map(() => void 0));
  }

  getUserStats(): Observable<UserStats> {
    return this.http
      .get<{ success: boolean; stats: UserStats }>(`${this.apiUrl}/stats`)
      .pipe(map((res) => res.stats));
  }
}
