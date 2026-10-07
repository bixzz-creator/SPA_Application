import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthUser } from '../../core/models/user.model';
import { filter } from 'rxjs/operators';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  currentUser: AuthUser | null = null;
  currentRoute = '';
  isCollapsed = false;

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: '🏠', route: '/dashboard' },
    { label: 'My Records', icon: '📋', route: '/records', roles: ['GENERAL_USER'] },
    { label: 'All Records', icon: '📂', route: '/records', roles: ['ADMIN'] },
    { label: 'User Management', icon: '👥', route: '/admin/users', roles: ['ADMIN'] },
    { label: 'Profile', icon: '👤', route: '/profile' },
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.currentRoute = (e as NavigationEnd).url;
      });

    this.currentRoute = this.router.url;
  }

  get filteredNavItems(): NavItem[] {
    return this.navItems.filter((item) => {
      if (!item.roles) return true;
      return item.roles.includes(this.currentUser?.role || '');
    });
  }

  isActive(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}
