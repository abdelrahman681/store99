import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { ToastService } from '../../../core/services/toast.service';
import { Notification } from '../../../core/models/notification.model';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

import { IllustrationComponent } from '../../../shared/components/illustration/illustration.component';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, PaginationComponent, IllustrationComponent],
  templateUrl: './notifications.component.html'
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private toast = inject(ToastService);

  notifications: Notification[] = [];
  loading = false;
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(page: number = 1, manual = false): void {
    this.loading = true;
    this.notificationService.getMyNotifications(page, this.pageSize).subscribe({
      next: result => {
        this.notifications = result.data;
        this.currentPage = result.pageIndex;
        this.totalPages = result.totalPages;
        this.loading = false;
        if (manual) this.toast.success('تم تحديث الإشعارات');
      },
      error: () => {
        this.loading = false;
        this.toast.error('تعذر تحميل الإشعارات');
      }
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.loadNotifications(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
