import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthUser } from '../../core/models/user.model';

@Component({
  selector: 'app-topbar',
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <h2 class="page-title">{{ getPageTitle() }}</h2>
      </div>
      <div class="topbar-right">
        <div class="user-menu" *ngIf="currentUser">
          <div class="user-avatar-sm">{{ currentUser.name.charAt(0).toUpperCase() }}</div>
          <div class="user-info-sm">
            <span class="user-name-sm">{{ currentUser.name }}</span>
            <span class="user-role-sm">{{ currentUser.role === 'ADMIN' ? 'Administrator' : 'General User' }}</span>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      background: #fff;
      border-bottom: 1px solid #e5e7eb;
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .page-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }
    .topbar-right { display: flex; align-items: center; gap: 1rem; }
    .user-menu { display: flex; align-items: center; gap: 0.75rem; }
    .user-avatar-sm {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      font-weight: 700;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-info-sm {
      display: flex;
      flex-direction: column;
    }
    .user-name-sm {
      font-size: 0.875rem;
      font-weight: 600;
      color: #111827;
    }
    .user-role-sm {
      font-size: 0.72rem;
      color: #9ca3af;
    }
  `],
})
export class TopbarComponent implements OnInit {
  currentUser: AuthUser | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('/dashboard')) return '📊 Dashboard';
    if (url.includes('/records')) return '📋 Records';
    if (url.includes('/admin/users')) return '👥 User Management';
    if (url.includes('/profile')) return '👤 My Profile';
    return 'AccessHub';
  }
}
