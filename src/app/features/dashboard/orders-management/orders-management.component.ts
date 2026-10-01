import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import { BasketItem } from '../../../core/models/basket.model';
import { DeliveryMethodDTO } from '../../../core/models/delivery-method.model';
import { OrderToReturn } from '../../../core/models/order.model';

import { BasketService } from '../../../core/services/basket.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';

import { apiErrorMessage } from '../../../core/utils/api-error';
import {
  orderStatusClass,
  orderStatusLabel
} from '../../../core/utils/order-status';

import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

import { selectBasketItems } from '../../../store/basket/basket.selectors';
import { OrdersActions } from '../../../store/orders/orders.actions';

@Component({
  selector: 'app-orders-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    PaginationComponent
  ],
  templateUrl: './orders-management.component.html'
})
export class OrdersManagementComponent implements OnInit {

  private fb = inject(FormBuilder);
  private store = inject(Store);
  private destroyRef = inject(DestroyRef);

  private orderService = inject(OrderService);
  private basketService = inject(BasketService);
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);

  statusLabel = orderStatusLabel;
  statusClass = orderStatusClass;

  // OrderStatus enum
  // pending = 0
  // PaymentSuccssed = 1
  // PaymentFailed = 2
  // Cancelled = 3
  // Delivered = 4
  orderStatuses = [
    { value: 0, label: 'قيد الانتظار' },
    { value: 1, label: 'تم الدفع' },
    { value: 2, label: 'فشل الدفع' },
    { value: 3, label: 'ملغي' },
    { value: 4, label: 'تم التسليم' }
  ];

  orders: OrderToReturn[] = [];

  loading = true;

  pageIndex = 1;
  totalPages = 0;

  readonly pageSize = 10;

  deliveryMethods: DeliveryMethodDTO[] = [];
  basketItems: BasketItem[] = [];

  editing: OrderToReturn | null = null;
  saving = false;

  form = this.fb.nonNullable.group({
    fName: ['', Validators.required],
    lName: ['', Validators.required],
    street: ['', Validators.required],
    city: ['', Validators.required],
    government: ['', Validators.required],

    deliveryMethodId: [
      0,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    status: [0, Validators.required]
  });

  ngOnInit(): void {

    this.load(1);

    this.basketService.getDeliveryMethods().subscribe({
      next: methods => {
        this.deliveryMethods = Array.isArray(methods)
          ? methods
          : [];
      },

      error: () => {
        this.toast.error('تعذر تحميل طرق الشحن');
      }
    });

    this.store
      .select(selectBasketItems)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(items => {
        this.basketItems = items ?? [];
      });
  }

  load(page: number): void {

    this.loading = true;

    this.orderService
      .getOrdersForUser(page, this.pageSize)
      .subscribe({

        next: res => {

          this.orders = res.data ?? [];

          this.pageIndex = res.pageIndex ?? page;

          this.totalPages = res.totalPages ?? 0;

          this.loading = false;
        },

        error: () => {

          this.loading = false;

          this.toast.error('تعذر تحميل الطلبات');
        }
      });
  }

  // Admin can edit all orders
  canEdit(o: OrderToReturn): boolean {
    return true;
  }

  getStatusValue(status: string | number): number {

    if (typeof status === 'number') {
      return status;
    }

    const map: Record<string, number> = {

      pending: 0,

      paymentsuccssed: 1,

      paymentfailed: 2,

      cancelled: 3,

      delivered: 4
    };

    return map[status.toLowerCase()] ?? 0;
  }

  startEdit(o: OrderToReturn): void {

    this.editing = o;

    const method = this.deliveryMethods.find(
      m => m.shortName === o.deliveryMethod
    );

    this.form.reset({

      fName: o.address?.fName ?? '',

      lName: o.address?.lName ?? '',

      street: o.address?.street ?? '',

      city: o.address?.city ?? '',

      government: o.address?.government ?? '',

      deliveryMethodId: method?.id ?? 0,

      status: this.getStatusValue(o.status)
    });

    setTimeout(() => {

      document
        .getElementById('order-edit')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

    });
  }

  cancelEdit(): void {
    this.editing = null;
  }

  async save(): Promise<void> {

    const order = this.editing;

    if (!order) {
      return;
    }

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      this.toast.warning(
        'من فضلك املأ كل البيانات واختر طريقة الشحن والحالة'
      );

      return;
    }

    if (this.basketItems.length === 0) {

      this.toast.warning(
        'سلتك فاضية — أضف المنتجات الجديدة للسلة الأول'
      );

      return;
    }

    const ok = await this.confirmService.ask({

      title: 'تعديل الطلب',

      message:
        `هيتم تعديل الطلب #${order.id}، ` +
        `وهتتغير منتجاته لمحتوى سلتك الحالية ` +
        `(${this.basketItems.length} منتج). متأكد؟`,

      confirmText: 'نعم، عدّل الطلب'
    });

    if (!ok) {
      return;
    }

    const {
      deliveryMethodId,
      status,
      ...address
    } = this.form.getRawValue();

    this.saving = true;

    this.orderService
      .updateOrder(order.id, {

        shippingAddress: address,

        basketId:
          this.basketService.getOrCreateBasketId(),

        deliveryMethodId,

        status
      })
      .subscribe({

        next: () => {

          this.saving = false;

          this.editing = null;

          this.toast.success(
            'تم تعديل الطلب بنجاح ✅'
          );

          this.load(this.pageIndex);

          this.store.dispatch(
            OrdersActions.refreshOrders({
              pageIndex: 1,
              pageSize: 10
            })
          );
        },

        error: err => {

          this.saving = false;

          this.toast.error(
            apiErrorMessage(
              err,
              'تعذر تعديل الطلب'
            )
          );
        }
      });
  }
}