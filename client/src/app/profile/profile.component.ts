import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AuthService } from '../core/services/auth.service';
import { UserService } from '../core/services/user.service';
import { AuthUser, User } from '../core/models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentUser: AuthUser | null = null;
  userProfile: User | null = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  isLoading = true;
  isSavingProfile = false;
  isSavingPassword = false;

  successMessage = '';
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadProfile();
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
    });

    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  loadProfile(): void {
    this.isLoading = true;
    this.userService
      .getCurrentUser()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (user) => {
          this.userProfile = user;
          this.profileForm.patchValue({
            name: user.name,
            email: user.email,
          });
        },
        error: (err) => {
          this.errorMessage =
            err.error?.message || 'Failed to load user profile.';
        },
      });
  }

  saveProfile(): void {
    if (this.profileForm.invalid || !this.userProfile?._id) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSavingProfile = true;
    this.errorMessage = '';

    this.userService
      .updateUser(this.userProfile._id, {
        name: this.profileForm.value.name,
        email: this.profileForm.value.email,
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSavingProfile = false))
      )
      .subscribe({
        next: (updated) => {
          this.userProfile = updated;
          if (this.currentUser) {
            this.currentUser.name = updated.name;
            this.currentUser.email = updated.email;
          }
          this.showSuccess('Personal information updated successfully!');
        },
        error: (err) => {
          this.errorMessage =
            err.error?.message || 'Failed to update personal details.';
        },
      });
  }

  changePassword(): void {
    if (this.passwordForm.invalid || !this.userProfile?._id) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    if (
      this.passwordForm.value.password !== this.passwordForm.value.confirmPassword
    ) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isSavingPassword = true;
    this.errorMessage = '';

    this.userService
      .updateUser(this.userProfile._id, {
        password: this.passwordForm.value.password,
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSavingPassword = false))
      )
      .subscribe({
        next: () => {
          this.showSuccess('Password updated successfully!');
          this.passwordForm.reset();
        },
        error: (err) => {
          this.errorMessage =
            err.error?.message || 'Failed to update password.';
        },
      });
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
