import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirmation-dialog',
  template: `
    <div class="dialog-overlay" *ngIf="isOpen" (click)="onOverlayClick($event)">
      <div class="dialog-card">
        <div class="dialog-icon">{{ icon }}</div>
        <h2 class="dialog-title">{{ title }}</h2>
        <p class="dialog-message">{{ message }}</p>
        <div class="dialog-actions">
          <button class="btn btn-cancel" (click)="cancel()">Cancel</button>
          <button class="btn btn-confirm" [class.btn-danger]="isDanger" (click)="confirm()">
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.15s ease;
    }
    .dialog-card {
      background: #fff;
      border-radius: 1rem;
      padding: 2rem;
      max-width: 420px;
      width: 90%;
      text-align: center;
      animation: slideUp 0.2s ease;
      box-shadow: 0 25px 50px rgba(0,0,0,0.2);
    }
    .dialog-icon { font-size: 3rem; margin-bottom: 1rem; }
    .dialog-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #111827;
      margin: 0 0 0.5rem;
    }
    .dialog-message {
      color: #6b7280;
      font-size: 0.9rem;
      margin: 0 0 1.5rem;
    }
    .dialog-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
    }
    .btn {
      padding: 0.6rem 1.5rem;
      border-radius: 0.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-cancel {
      background: #f3f4f6;
      color: #374151;
    }
    .btn-cancel:hover { background: #e5e7eb; }
    .btn-confirm {
      background: #6366f1;
      color: #fff;
    }
    .btn-confirm:hover { background: #4f46e5; }
    .btn-danger { background: #ef4444 !important; }
    .btn-danger:hover { background: #dc2626 !important; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `],
})
export class ConfirmationDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Are you sure?';
  @Input() message = 'This action cannot be undone.';
  @Input() confirmLabel = 'Confirm';
  @Input() isDanger = false;
  @Input() icon = '⚠️';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  confirm(): void {
    this.confirmed.emit();
  }

  cancel(): void {
    this.cancelled.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-overlay')) {
      this.cancel();
    }
  }
}
