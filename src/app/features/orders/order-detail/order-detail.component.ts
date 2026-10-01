import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { take, timer } from 'rxjs';
import { OrdersActions } from '../../../store/orders/orders.actions';
import { selectOrdersLoading, selectSelectedOrder } from '../../../store/orders/orders.selectors';
import { OrderToReturn } from '../../../core/models/order.model';
import { ToastService } from '../../../core/services/toast.service';
import { isAwaitingPayment, orderStatusClass, orderStatusLabel } from '../../../core/utils/order-status';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail.component.html'
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private store = inject(Store);
  private destroyRef = inject(DestroyRef);
  private toast = inject(ToastService);

  order$ = this.store.select(selectSelectedOrder);
  loading$ = this.store.select(selectOrdersLoading);

  statusLabel = orderStatusLabel;
  statusClass = orderStatusClass;
  isAwaitingPayment = isAwaitingPayment;

  private id = 0;
  private current: OrderToReturn | null = null;

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.store.dispatch(OrdersActions.loadOrder({ id: this.id }));

    // Remember the latest order; when a card order flips from "pending" to paid, tell the customer.
    this.order$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(order => {
      const before = this.current;
      this.current = order;
      if (before && order && before.id === order.id && isAwaitingPayment(before) && !isAwaitingPayment(order)) {
        this.toast.success('تم تأكيد الدفع ✅');
      }
    });

    // A card payment is confirmed by Stripe's webhook a few seconds AFTER the order is created, so the
    // order first shows "Pending". Re-check quietly every 3s (for up to ~1 minute) until it changes.
    timer(3000, 3000)
      .pipe(take(20), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (isAwaitingPayment(this.current)) {
          this.store.dispatch(OrdersActions.refreshOrder({ id: this.id }));
        }
      });
  }
}
