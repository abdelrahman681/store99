import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';

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
  private orderService = inject(OrderService);
  private basketService = inject(BasketService);
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);

  statusLabel = orderStatusLabel;
  statusClass = orderStatusClass;

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

  editing: OrderToReturn | null = null;

  saving = false;

  // View Order
  viewingOrder: OrderToReturn | null = null;
  viewingLoading = false;

  // Edit Form
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
    this.loadDeliveryMethods();
  }

  // =========================
  // Order Calculations
  // =========================

  /**
   * إجمالي المنتجات:
   * سعر القطعة × الكمية لكل منتج.
   */
getItemsSubtotal(order: OrderToReturn): number {

  if (!order.items?.length) {
    return Number(order.subTotal) || 0;
  }

  return order.items.reduce(
    (total, item) =>
      total +
      (Number(item.price) * Number(item.quantity)),
    0
  );
}

  /**
   * تكلفة الشحن الفعلية القادمة من Backend.
   */
  getShippingCost(order: OrderToReturn): number {

    return Math.max(
      0,
      Number(order.deliveryMethodCost) || 0
    );

  }

  /**
   * الإجمالي النهائي = المنتجات + الشحن.
   */
  getFinalTotal(order: OrderToReturn): number {

    return this.getItemsSubtotal(order)
      + this.getShippingCost(order);

  }

  // =========================
  // Load Delivery Methods
  // =========================

  loadDeliveryMethods(): void {

    this.basketService
      .getDeliveryMethods()
      .subscribe({

        next: methods => {

          this.deliveryMethods =
            Array.isArray(methods) ? methods : [];

        },

        error: () => {

          this.toast.error('تعذر تحميل طرق الشحن');

        }

      });

  }

  // =========================
  // Load Orders
  // =========================

  load(page: number): void {

    this.loading = true;

    this.orderService
      .getOrders(page, this.pageSize)
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

  // =========================
  // View Order
  // =========================

  viewOrder(orderId: number): void {

    this.viewingLoading = true;
    this.viewingOrder = null;

    this.orderService
      .getOrderById02(orderId)
      .subscribe({

        next: order => {

          this.viewingOrder = order;

          this.viewingLoading = false;

          setTimeout(() => {

            document
              .getElementById('order-view')
              ?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });

          });

        },

        error: (err: any) => {

          this.viewingLoading = false;

          this.toast.error(
            apiErrorMessage(
              err,
              'تعذر تحميل بيانات الطلب'
            )
          );

        }

      });

  }

  closeView(): void {
    this.viewingOrder = null;
  }

  // =========================
  // Edit
  // =========================

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

  // =========================
  // Save Edit
  // =========================

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

    const ok = await this.confirmService.ask({

      title: 'تعديل الطلب',

      message:
        `هيتم تعديل الطلب #${order.id} ` +
        `وتحديث بيانات العنوان وطريقة الشحن وحالة الطلب. متأكد؟`,

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
      .updateOrder(

        order.id,

        {
          shippingAddress: address,
          deliveryMethodId,
          status
        }

      )
      .subscribe({

        next: updatedOrder => {

          this.saving = false;
          this.editing = null;
          this.viewingOrder = updatedOrder;

          this.toast.success(
            'تم تعديل الطلب بنجاح ✅'
          );

          this.load(this.pageIndex);

        },

        error: (err: any) => {

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

  // =========================
  // Print Order
  // =========================

  printOrder(orderId: number): void {

    this.orderService
      .getOrderById02(orderId)
      .subscribe({

        next: order => {

          const printWindow = window.open(
            '',
            '_blank',
            'width=900,height=700'
          );

          if (!printWindow) {

            this.toast.error(
              'السماح بالنوافذ المنبثقة مطلوب للطباعة'
            );

            return;

          }

          const itemsHtml = (order.items ?? [])
            .map(item => {

              const price = Number(item.price) || 0;
              const quantity = Number(item.quantity) || 0;
              const itemTotal = price * quantity;

              return `
                <tr>
                  <td>${item.productName}</td>
                  <td>${quantity}</td>
                  <td>${price.toFixed(2)} ج.م</td>
                  <td>${itemTotal.toFixed(2)} ج.م</td>
                </tr>
              `;

            })
            .join('');

          const itemsSubtotal = this.getItemsSubtotal(order);
          const shippingCost = this.getShippingCost(order);
          const finalTotal = itemsSubtotal + shippingCost;

          printWindow.document.write(`

            <!DOCTYPE html>

            <html lang="ar" dir="rtl">

            <head>

              <meta charset="UTF-8">

              <title>فاتورة الطلب #${order.id}</title>

              <style>

                * {
                  box-sizing: border-box;
                }

                body {
                  font-family: Tahoma, Arial, sans-serif;
                  direction: rtl;
                  padding: 30px;
                  color: #222;
                }

                .invoice {
                  max-width: 800px;
                  margin: auto;
                }

                .header {
                  text-align: center;
                  border-bottom: 2px solid #222;
                  padding-bottom: 20px;
                  margin-bottom: 25px;
                }

                h1 {
                  margin: 0 0 10px;
                }

                .info {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 15px;
                  margin-bottom: 25px;
                }

                .info div {
                  padding: 10px;
                  background: #f5f5f5;
                  border-radius: 5px;
                }

                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 20px;
                }

                th, td {
                  border: 1px solid #ddd;
                  padding: 12px;
                  text-align: center;
                }

                th {
                  background: #eee;
                }

                .summary {
                  width: 350px;
                  max-width: 100%;
                  margin-right: auto;
                  margin-top: 25px;
                  border: 1px solid #ddd;
                  border-radius: 5px;
                  padding: 15px;
                }

                .summary-row {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 12px;
                }

                .summary-row:last-child {
                  margin-bottom: 0;
                }

                .final-total {
                  font-size: 20px;
                  font-weight: bold;
                  border-top: 1px solid #ddd;
                  padding-top: 12px;
                  margin-top: 12px;
                }

                .footer {
                  text-align: center;
                  margin-top: 50px;
                  color: #777;
                }

                @media print {
                  body {
                    padding: 10px;
                  }

                  .invoice {
                    width: 100%;
                  }
                }

              </style>

            </head>

            <body>

              <div class="invoice">

                <div class="header">

                  <h1>فاتورة طلب</h1>

                  <p>رقم الطلب: #${order.id}</p>

                  <p>
                    التاريخ:
                    ${new Date(order.dateOfCreate).toLocaleString('ar-EG')}
                  </p>

                </div>

                <h3>بيانات العميل</h3>

                <div class="info">

                  <div>
                    الاسم:
                    ${order.address.fName} ${order.address.lName}
                  </div>

                  <div>
                    المحافظة:
                    ${order.address.government}
                  </div>

                  <div>
                    المدينة:
                    ${order.address.city}
                  </div>

                  <div>
                    الشارع:
                    ${order.address.street}
                  </div>

                  <div>
                    طريقة الشحن:
                    ${order.deliveryMethod}
                  </div>

                  <div>
                    حالة الطلب:
                    ${this.statusLabel(order.status)}
                  </div>

                </div>

                <h3>المنتجات</h3>

                <table>

                  <thead>

                    <tr>
                      <th>المنتج</th>
                      <th>الكمية</th>
                      <th>سعر القطعة</th>
                      <th>الإجمالي</th>
                    </tr>

                  </thead>

                  <tbody>
                    ${itemsHtml}
                  </tbody>

                </table>

                <div class="summary">

                  <div class="summary-row">
                    <span>إجمالي المنتجات</span>
                    <strong>${itemsSubtotal.toFixed(2)} ج.م</strong>
                  </div>

                  <div class="summary-row">
                    <span>تكلفة الشحن</span>
                    <strong>${shippingCost.toFixed(2)} ج.م</strong>
                  </div>

                  <div class="summary-row final-total">
                    <span>الإجمالي النهائي</span>
                    <strong>${finalTotal.toFixed(2)} ج.م</strong>
                  </div>

                </div>

                <div class="footer">
                  شكراً لتسوقكم معنا
                </div>

              </div>

              <script>

                window.onload = function() {
                  window.print();
                };

                window.onafterprint = function() {
                  window.close();
                };

              </script>

            </body>

            </html>

          `);

          printWindow.document.close();

        },

        error: () => {

          this.toast.error(
            'تعذر تحميل بيانات الفاتورة'
          );

        }

      });

  }

}