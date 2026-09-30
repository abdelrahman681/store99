import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { OrdersActions } from '../../../store/orders/orders.actions';
import { selectOrdersLoading, selectSelectedOrder } from '../../../store/orders/orders.selectors';
import { orderStatusClass, orderStatusLabel } from '../../../core/utils/order-status';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail.component.html'
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private store = inject(Store);

  order$ = this.store.select(selectSelectedOrder);
  loading$ = this.store.select(selectOrdersLoading);

  statusLabel = orderStatusLabel;
  statusClass = orderStatusClass;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.store.dispatch(OrdersActions.loadOrder({ id }));
  }
}
