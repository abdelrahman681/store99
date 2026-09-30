import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { OrdersActions } from '../../../store/orders/orders.actions';
import { selectAllOrders, selectOrdersLoading, selectOrdersTotalPages } from '../../../store/orders/orders.selectors';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ConfirmService } from '../../../core/services/confirm.service';
import { orderStatusClass, orderStatusLabel } from '../../../core/utils/order-status';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent],
  templateUrl: './order-list.component.html'
})
export class OrderListComponent implements OnInit {
  private store = inject(Store);
  private confirmService = inject(ConfirmService);

  currentPage = 1;
  pageSize = 5;

  orders$ = this.store.select(selectAllOrders);
  loading$ = this.store.select(selectOrdersLoading);
  totalPages$ = this.store.select(selectOrdersTotalPages);

  statusLabel = orderStatusLabel;
  statusClass = orderStatusClass;

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.store.dispatch(OrdersActions.loadOrders({ pageIndex: this.currentPage, pageSize: this.pageSize }));
  }

  goToPage(page: number): void {
    if (page < 1) return;
    this.currentPage = page;
    this.loadOrders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // success / failure toasts come from OrdersEffects
  async cancel(id: number): Promise<void> {
    const ok = await this.confirmService.ask({
      title: 'إلغاء الطلب',
      message: `هل أنت متأكد أنك تريد إلغاء الطلب #${id}؟`,
      confirmText: 'نعم، إلغاء الطلب',
      cancelText: 'رجوع',
      tone: 'danger'
    });
    if (ok) this.store.dispatch(OrdersActions.cancelOrder({ id }));
  }
}
