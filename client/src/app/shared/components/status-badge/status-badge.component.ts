import { Component, Input } from '@angular/core';

type BadgeType = 'status' | 'role' | 'priority';

@Component({
  selector: 'app-status-badge',
  template: `
    <span class="badge" [ngClass]="badgeClass">{{ label }}</span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.025em;
      text-transform: uppercase;
    }
    .badge-success { background: #d1fae5; color: #065f46; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-info { background: #dbeafe; color: #1e40af; }
    .badge-purple { background: #ede9fe; color: #5b21b6; }
    .badge-gray { background: #f3f4f6; color: #374151; }
    .badge-orange { background: #ffedd5; color: #9a3412; }
  `],
})
export class StatusBadgeComponent {
  @Input() value = '';
  @Input() set status(val: string) {
    if (val) this.value = val;
  }
  @Input() type: BadgeType = 'status';


  get label(): string {
    if (this.type === 'role') {
      return this.value === 'ADMIN' ? 'Admin' : 'General User';
    }
    return this.value;
  }

  get badgeClass(): string {
    if (this.type === 'role') {
      return this.value === 'ADMIN' ? 'badge badge-purple' : 'badge badge-info';
    }
    if (this.type === 'priority') {
      const map: Record<string, string> = {
        High: 'badge-danger',
        Medium: 'badge-warning',
        Low: 'badge-success',
      };
      return `badge ${map[this.value] || 'badge-gray'}`;
    }
    // status type
    const map: Record<string, string> = {
      ACTIVE: 'badge-success',
      INACTIVE: 'badge-danger',
      Completed: 'badge-success',
      Pending: 'badge-warning',
      'In Progress': 'badge-info',
      Rejected: 'badge-danger',
    };
    return `badge ${map[this.value] || 'badge-gray'}`;
  }
}
