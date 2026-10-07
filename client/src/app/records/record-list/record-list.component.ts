import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, finalize } from 'rxjs/operators';
import { RecordService, RecordFilters } from '../../core/services/record.service';
import { AuthService } from '../../core/services/auth.service';
import {
  Record,
  RecordStatus,
  RecordCategory,
  RecordPriority,
} from '../../core/models/record.model';
import { AuthUser } from '../../core/models/user.model';

@Component({
  selector: 'app-record-list',
  templateUrl: './record-list.component.html',
  styleUrls: ['./record-list.component.scss'],
})
export class RecordListComponent implements OnInit, OnDestroy {
  records: Record[] = [];
  filteredRecords: Record[] = [];
  currentUser: AuthUser | null = null;
  isLoading = false;
  loadingMessage = 'Fetching records...';
  errorMessage = '';
  successMessage = '';

  // Filter & Async Demo Controls
  selectedStatus: RecordStatus | '' = '';
  selectedCategory: RecordCategory | '' = '';
  searchQuery = '';
  simulatedDelay = 0; // ms
  private searchSubject$ = new Subject<string>();

  // Modal State
  isModalOpen = false;
  isEditMode = false;
  editingRecordId: string | null = null;
  recordForm!: FormGroup;
  isSubmitting = false;

  // Delete Dialog State
  isDeleteDialogOpen = false;
  recordToDelete: Record | null = null;

  // Categories & Statuses
  readonly categories: RecordCategory[] = [
    'Finance',
    'HR',
    'IT',
    'Operations',
    'Compliance',
    'Legal',
  ];
  readonly statuses: RecordStatus[] = [
    'Pending',
    'In Progress',
    'Completed',
    'Rejected',
  ];
  readonly priorities: RecordPriority[] = ['Low', 'Medium', 'High'];

  private destroy$ = new Subject<void>();

  constructor(
    private recordService: RecordService,
    private authService: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    // Debounced search
    this.searchSubject$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.searchQuery = query;
        this.loadRecords();
      });

    // Check query params for quick action
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['action'] === 'new') {
        this.openCreateModal();
      }
    });

    this.loadRecords();
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  initForm(): void {
    this.recordForm = this.fb.group({
      recordId: [''],
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      category: ['HR', [Validators.required]],
      status: ['Pending', [Validators.required]],
      priority: ['Medium', [Validators.required]],
      description: ['', [Validators.maxLength(1000)]],
    });
  }

  loadRecords(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.loadingMessage =
      this.simulatedDelay > 0
        ? `Simulating async API delay (${this.simulatedDelay}ms)...`
        : 'Loading records...';

    const filters: RecordFilters = {
      status: this.selectedStatus ? this.selectedStatus : undefined,
      category: this.selectedCategory ? this.selectedCategory : undefined,
      search: this.searchQuery.trim() ? this.searchQuery.trim() : undefined,
      delay: this.simulatedDelay > 0 ? this.simulatedDelay : undefined,
    };

    this.recordService
      .getRecords(filters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (data) => {
          this.records = data;
        },
        error: (err) => {
          this.errorMessage =
            err.error?.message || 'Failed to load records. Please try again.';
        },
      });
  }

  onSearchChange(val: string): void {
    this.searchSubject$.next(val);
  }

  onFilterChange(): void {
    this.loadRecords();
  }

  setDelay(delay: number): void {
    this.simulatedDelay = delay;
    this.loadRecords();
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.editingRecordId = null;
    this.recordForm.reset({
      recordId: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
      category: 'HR',
      status: 'Pending',
      priority: 'Medium',
      description: '',
    });
    this.isModalOpen = true;
  }

  openEditModal(record: Record): void {
    this.isEditMode = true;
    this.editingRecordId = record._id || null;
    this.recordForm.patchValue({
      recordId: record.recordId,
      title: record.title,
      category: record.category,
      status: record.status,
      priority: record.priority || 'Medium',
      description: record.description || '',
    });
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.recordForm.reset();
  }

  saveRecord(): void {
    if (this.recordForm.invalid) {
      this.recordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formVal = this.recordForm.value;

    if (this.isEditMode && this.editingRecordId) {
      this.recordService
        .updateRecord(this.editingRecordId, formVal)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => (this.isSubmitting = false))
        )
        .subscribe({
          next: () => {
            this.showSuccess('Record updated successfully!');
            this.closeModal();
            this.loadRecords();
          },
          error: (err) => {
            this.errorMessage =
              err.error?.message || 'Failed to update record.';
          },
        });
    } else {
      this.recordService
        .createRecord(formVal)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => (this.isSubmitting = false))
        )
        .subscribe({
          next: () => {
            this.showSuccess('New record created successfully!');
            this.closeModal();
            this.loadRecords();
          },
          error: (err) => {
            this.errorMessage =
              err.error?.message || 'Failed to create record.';
          },
        });
    }
  }

  confirmDelete(record: Record): void {
    this.recordToDelete = record;
    this.isDeleteDialogOpen = true;
  }

  onDeleteConfirmed(): void {
    if (!this.recordToDelete || !this.recordToDelete._id) return;

    this.recordService
      .deleteRecord(this.recordToDelete._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Record deleted successfully!');
          this.isDeleteDialogOpen = false;
          this.recordToDelete = null;
          this.loadRecords();
        },
        error: (err) => {
          this.errorMessage =
            err.error?.message || 'Failed to delete record.';
          this.isDeleteDialogOpen = false;
        },
      });
  }

  onDeleteCancelled(): void {
    this.isDeleteDialogOpen = false;
    this.recordToDelete = null;
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => {
      this.successMessage = '';
    }, 4000);
  }

  canModify(record: Record): boolean {
    if (this.isAdmin) return true;
    return record.owner === this.currentUser?.userId;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
