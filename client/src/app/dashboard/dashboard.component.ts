import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AuthService } from '../core/services/auth.service';
import { RecordService } from '../core/services/record.service';
import { UserService } from '../core/services/user.service';
import { AuthUser } from '../core/models/user.model';
import { Record, RecordStats } from '../core/models/record.model';
import { UserStats } from '../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: AuthUser | null = null;
  recordStats: RecordStats | null = null;
  userStats: UserStats | null = null;
  recentRecords: Record[] = [];
  isLoading = true;
  loadingMessage = 'Loading your dashboard...';
  error = '';

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private recordService: RecordService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = '';
    this.loadingMessage = 'Fetching your dashboard data...';

    if (this.isAdmin) {
      forkJoin({
        recordStats: this.recordService.getRecordStats(),
        userStats: this.userService.getUserStats(),
        records: this.recordService.getRecords(),
      })
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => (this.isLoading = false))
        )
        .subscribe({
          next: (data) => {
            this.recordStats = data.recordStats;
            this.userStats = data.userStats;
            this.recentRecords = data.records.slice(0, 5);
          },
          error: () => {
            this.error = 'Failed to load dashboard data. Please try again.';
          },
        });
    } else {
      forkJoin({
        recordStats: this.recordService.getRecordStats(),
        records: this.recordService.getRecords(),
      })
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => (this.isLoading = false))
        )
        .subscribe({
          next: (data) => {
            this.recordStats = data.recordStats;
            this.recentRecords = data.records.slice(0, 5);
          },
          error: () => {
            this.error = 'Failed to load dashboard data. Please try again.';
          },
        });
    }
  }

  retry(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
