import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, finalize } from 'rxjs/operators';
import { UserService, UserFilters } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import {
  User,
  UserStats,
  UserRole,
  UserStatus,
  AuthUser,
} from '../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  userStats: UserStats | null = null;
  currentUser: AuthUser | null = null;
  isLoading = false;
  loadingMessage = 'Loading users...';
  errorMessage = '';
  successMessage = '';

  // Filter & Delay Controls
  selectedRole: UserRole | '' = '';
  selectedStatus: UserStatus | '' = '';
  searchQuery = '';
  simulatedDelay = 0;
  private searchSubject$ = new Subject<string>();

  // Modal State
  isModalOpen = false;
  isEditMode = false;
  editingUserId: string | null = null;
  userForm!: FormGroup;
  isSubmitting = false;

  // Delete Dialog State
  isDeleteDialogOpen = false;
  userToDelete: User | null = null;

  readonly roles: UserRole[] = ['ADMIN', 'GENERAL_USER'];
  readonly statuses: UserStatus[] = ['ACTIVE', 'INACTIVE'];

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    this.searchSubject$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.searchQuery = query;
        this.loadUsers();
      });

    this.loadStats();
    this.loadUsers();
  }

  initForm(): void {
    this.userForm = this.fb.group({
      userId: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_-]{3,20}$/)]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      role: ['GENERAL_USER', [Validators.required]],
      status: ['ACTIVE', [Validators.required]],
    });
  }

  loadStats(): void {
    this.userService
      .getUserStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => (this.userStats = stats),
        error: () => {},
      });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.loadingMessage =
      this.simulatedDelay > 0
        ? `Simulating async API delay (${this.simulatedDelay}ms)...`
        : 'Loading user directory...';

    const filters: UserFilters = {
      role: this.selectedRole ? this.selectedRole : undefined,
      status: this.selectedStatus ? this.selectedStatus : undefined,
      search: this.searchQuery.trim() ? this.searchQuery.trim() : undefined,
      delay: this.simulatedDelay > 0 ? this.simulatedDelay : undefined,
    };

    this.userService
      .getUsers(filters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (data) => {
          this.users = data;
        },
        error: (err) => {
          this.errorMessage =
            err.error?.message || 'Failed to load users. Please try again.';
        },
      });
  }

  onSearchChange(val: string): void {
    this.searchSubject$.next(val);
  }

  onFilterChange(): void {
    this.loadUsers();
  }

  setDelay(delay: number): void {
    this.simulatedDelay = delay;
    this.loadUsers();
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.editingUserId = null;
    this.userForm.reset({
      userId: '',
      name: '',
      email: '',
      password: '',
      role: 'GENERAL_USER',
      status: 'ACTIVE',
    });
    this.userForm.get('userId')?.enable();
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.isModalOpen = true;
  }

  openEditModal(user: User): void {
    this.isEditMode = true;
    this.editingUserId = user._id || null;
    this.userForm.patchValue({
      userId: user.userId,
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status,
    });
    this.userForm.get('userId')?.disable(); // userId is immutable
    this.userForm.get('password')?.setValidators([Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.userForm.reset();
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formVal = this.userForm.getRawValue();

    if (this.isEditMode && this.editingUserId) {
      const updatePayload: any = {
        name: formVal.name,
        email: formVal.email,
        role: formVal.role,
        status: formVal.status,
      };
      if (formVal.password) {
        updatePayload.password = formVal.password;
      }

      this.userService
        .updateUser(this.editingUserId, updatePayload)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => (this.isSubmitting = false))
        )
        .subscribe({
          next: () => {
            this.showSuccess('User account updated successfully!');
            this.closeModal();
            this.loadUsers();
            this.loadStats();
          },
          error: (err) => {
            this.errorMessage =
              err.error?.message || 'Failed to update user.';
          },
        });
    } else {
      this.userService
        .createUser(formVal)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => (this.isSubmitting = false))
        )
        .subscribe({
          next: () => {
            this.showSuccess('New user account created successfully!');
            this.closeModal();
            this.loadUsers();
            this.loadStats();
          },
          error: (err) => {
            this.errorMessage =
              err.error?.message || 'Failed to create user.';
          },
        });
    }
  }

  toggleStatus(user: User): void {
    if (!user._id) return;
    const newStatus: UserStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    this.userService
      .updateUserStatus(user._id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          user.status = updated.status;
          this.showSuccess(`User ${user.userId} is now ${newStatus.toLowerCase()}.`);
          this.loadStats();
        },
        error: (err) => {
          this.errorMessage =
            err.error?.message || 'Failed to update user status.';
        },
      });
  }

  confirmDelete(user: User): void {
    if (user.userId === this.currentUser?.userId) {
      this.errorMessage = 'You cannot delete your own logged-in account.';
      return;
    }
    this.userToDelete = user;
    this.isDeleteDialogOpen = true;
  }

  onDeleteConfirmed(): void {
    if (!this.userToDelete || !this.userToDelete._id) return;

    this.userService
      .deleteUser(this.userToDelete._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('User account removed successfully!');
          this.isDeleteDialogOpen = false;
          this.userToDelete = null;
          this.loadUsers();
          this.loadStats();
        },
        error: (err) => {
          this.errorMessage =
            err.error?.message || 'Failed to delete user.';
          this.isDeleteDialogOpen = false;
        },
      });
  }

  onDeleteCancelled(): void {
    this.isDeleteDialogOpen = false;
    this.userToDelete = null;
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => {
      this.successMessage = '';
    }, 4000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
