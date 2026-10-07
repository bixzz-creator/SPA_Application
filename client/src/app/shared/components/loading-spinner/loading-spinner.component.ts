import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="spinner-container" [class.fullscreen]="fullscreen">
      <div class="spinner-ring">
        <div></div><div></div><div></div><div></div>
      </div>
      <p class="spinner-message" *ngIf="message">{{ message }}</p>
      <p class="spinner-sub" *ngIf="subMessage">{{ subMessage }}</p>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      gap: 1rem;
    }
    .spinner-container.fullscreen {
      min-height: 400px;
    }
    .spinner-ring {
      display: inline-block;
      position: relative;
      width: 64px;
      height: 64px;
    }
    .spinner-ring div {
      box-sizing: border-box;
      display: block;
      position: absolute;
      width: 51px;
      height: 51px;
      margin: 6px;
      border: 6px solid transparent;
      border-radius: 50%;
      animation: spinner-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
      border-top-color: #6366f1;
    }
    .spinner-ring div:nth-child(1) { animation-delay: -0.45s; }
    .spinner-ring div:nth-child(2) { animation-delay: -0.3s; }
    .spinner-ring div:nth-child(3) { animation-delay: -0.15s; }
    @keyframes spinner-ring {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .spinner-message {
      color: #374151;
      font-size: 0.95rem;
      font-weight: 500;
      margin: 0;
    }
    .spinner-sub {
      color: #9ca3af;
      font-size: 0.8rem;
      margin: 0;
    }
  `],
})
export class LoadingSpinnerComponent {
  @Input() message = '';
  @Input() subMessage = '';
  @Input() fullscreen = false;
}
