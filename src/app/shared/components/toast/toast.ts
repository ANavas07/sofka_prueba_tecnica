import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { ToastConfiguration, ToastService } from '../../../services/toastService';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class Toast implements OnInit, OnDestroy {

  toasts: ToastConfiguration[] = [];
  private subscription!: Subscription;

  constructor(
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.subscription = this.toastService.toast$.subscribe(toast => {
      this.toasts.push(toast);
      this.cdr.detectChanges();
      if (toast.duration && toast.duration > 0) {
        setTimeout(() => this.removeToast(toast.id), toast.duration);
      }
    })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeToast(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.cdr.detectChanges();
  }

  getIcon(type: ToastConfiguration['type']): string {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type];
  }

}
