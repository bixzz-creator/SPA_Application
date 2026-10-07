import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUser, LoginRequest, LoginResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'accesshub_token';
  private readonly USER_KEY = 'accesshub_user';

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(
    this.loadUserFromStorage()
  );

  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(
        tap((response) => {
          if (response.success) {
            this.storeToken(response.token);
            this.storeUser(response.user);
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.currentUserSubject.value;
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'ADMIN';
  }

  isGeneralUser(): boolean {
    return this.getCurrentUser()?.role === 'GENERAL_USER';
  }

  get currentUser(): Observable<AuthUser | null> {
    return this.currentUser$;
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private storeUser(user: AuthUser): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private loadUserFromStorage(): AuthUser | null {
    try {
      const stored = localStorage.getItem(this.USER_KEY);
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  }

  refreshCurrentUser(): Observable<AuthUser> {
    return this.http
      .get<{ success: boolean; user: AuthUser }>(`${environment.apiUrl}/users/me`)
      .pipe(
        tap((res) => {
          if (res.success) {
            this.storeUser(res.user);
            this.currentUserSubject.next(res.user);
          }
        }),
        map((res) => res.user)
      );
  }
}
