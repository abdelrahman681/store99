import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';
import { Store } from '@ngrx/store';

import {
  loadStripe,
  Stripe,
  StripeCardElement,
  StripeElements
} from '@stripe/stripe-js';

import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  take
} from 'rxjs';

import { environment } from '../../../../environments/environment';

import { AddressService } from '../../../core/services/address.service';
import { BasketService } from '../../../core/services/basket.service';
import { PaymentService } from '../../../core/services/payment.service';
import { ToastService } from '../../../core/services/toast.service';

import { AddressDTO } from '../../../core/models/address.model';
import { DeliveryMethodDTO } from '../../../core/models/delivery-method.model';

import {
  selectBasket,
  selectBasketItems,
  selectBasketSubTotal
} from '../../../store/basket/basket.selectors';

import {
  selectOrdersError,
  selectOrdersLoading
} from '../../../store/orders/orders.selectors';

import { OrdersActions } from '../../../store/orders/orders.actions';

console.log('CHECKOUT COMPONENT LOADED');

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {

  private fb = inject(FormBuilder);
  private store = inject(Store);

  private addressService = inject(AddressService);
  private basketService = inject(BasketService);
  private paymentService = inject(PaymentService);
  private toastService = inject(ToastService);

  // =========================================
  // STRIPE
  // =========================================

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private cardElement: StripeCardElement | null = null;
  private clientSecret: string | null = null;

  preparingPayment = false;
  processingPayment = false;
  paymentError = '';

  // =========================================
  // BASKET
  // =========================================

  items$ = this.store.select(selectBasketItems);

  subTotal$ = this.store.select(
    selectBasketSubTotal
  );

  basket$ = this.store.select(
    selectBasket
  );

  // =========================================
  // DELIVERY
  // =========================================

  private selectedDeliveryMethod$ =
    new BehaviorSubject<DeliveryMethodDTO | null>(null);

  shippingCost$ =
    this.selectedDeliveryMethod$.pipe(
      map(method => method?.cost ?? 0)
    );

  total$ =
    combineLatest([
      this.subTotal$,
      this.shippingCost$
    ]).pipe(
      map(([subTotal, shippingCost]) =>
        subTotal + shippingCost
      )
    );

  // =========================================
  // ORDERS
  // =========================================

  loading$ = this.store.select(
    selectOrdersLoading
  );

  error$ = this.store.select(
    selectOrdersError
  );

  // =========================================
  // ADDRESSES
  // =========================================

  savedAddresses: AddressDTO[] = [];

  loadingAddresses = false;

  // =========================================
  // DELIVERY METHODS
  // =========================================

  deliveryMethods: DeliveryMethodDTO[] = [];

  loadingDeliveryMethods = false;

  selectedDeliveryMethod:
    DeliveryMethodDTO | null = null;

  // =========================================
  // FORM
  // =========================================

form = this.fb.nonNullable.group({
  addressId: [0],
  fName: ['', Validators.required],
  lName: ['', Validators.required],
  street: ['', Validators.required],
  city: ['', Validators.required],
  country: ['', Validators.required],
  deliveryMethodId: [0, Validators.required],
  paymentMethod: ['cod' as 'card' | 'cod']
});

  // =========================================
  // INIT
  // =========================================

  ngOnInit(): void {

    this.loadAddresses();

    this.loadDeliveryMethods();

  }

  // =========================================
  // SELECT PAYMENT METHOD
  // =========================================

  selectPaymentMethod(
    method: 'card' | 'cod'
  ): void {

    this.form.controls.paymentMethod
      .setValue(method);

    this.paymentError = '';

    // =======================================
    // CASH ON DELIVERY
    // =======================================

    if (method === 'cod') {

      this.preparingPayment = false;

      // Destroy Stripe element
      if (this.cardElement) {

        this.cardElement.destroy();

        this.cardElement = null;

      }

      this.elements = null;

      return;
    }

    // =======================================
    // CARD
    // =======================================

    this.preparingPayment = true;

    setTimeout(() => {

      if (
        this.stripe &&
        this.clientSecret
      ) {

        this.preparingPayment = false;

        setTimeout(() => {

          this.mountCardElement();

        }, 0);

      } else {

        this.preparePayment();

      }

    }, 0);

  }

  // =========================================
  // PREPARE STRIPE PAYMENT
  // =========================================

  private async preparePayment(): Promise<void> {

    this.preparingPayment = true;

    this.paymentError = '';

    try {

      // Load Stripe only once
      if (!this.stripe) {

        this.stripe =
          await loadStripe(
            environment.stripePublishableKey
          );

      }

      if (!this.stripe) {

        this.preparingPayment = false;

        this.paymentError =
          'تعذر تجهيز وسيلة الدفع';

        return;
      }

      this.store.select(
        selectBasket
      ).pipe(

        filter(
          basket =>
            !!basket &&
            basket.items.length > 0
        ),

        take(1)

      ).subscribe({

        next: basket => {

          this.paymentService
            .createOrUpdatePaymentIntent(
              basket!.id
            )
            .subscribe({

              next: updatedBasket => {

                this.clientSecret =
                  updatedBasket.clientSecret;

                this.preparingPayment =
                  false;

                // Wait for Angular
                // to render card element
                setTimeout(() => {

                  if (
                    this.form.controls
                      .paymentMethod.value === 'card'
                  ) {

                    this.mountCardElement();

                  }

                }, 100);

              },

              error: err => {

                console.error(
                  'Create Payment Intent Error:',
                  err
                );

                this.preparingPayment =
                  false;

                this.paymentError =
                  'تعذر تجهيز عملية الدفع، حاول تاني لاحقًا';

              }

            });

        },

        error: err => {

          console.error(
            'Get Basket Error:',
            err
          );

          this.preparingPayment =
            false;

          this.paymentError =
            'تعذر الحصول على السلة';

        }

      });

    } catch (error) {

      console.error(
        'Stripe initialization error:',
        error
      );

      this.preparingPayment =
        false;

      this.paymentError =
        'تعذر تجهيز وسيلة الدفع';

    }

  }

  // =========================================
  // MOUNT STRIPE CARD
  // =========================================

  private mountCardElement(): void {

    if (!this.stripe) {
      return;
    }

    // Destroy previous Stripe element
    if (this.cardElement) {

      this.cardElement.destroy();

      this.cardElement = null;

    }

    this.elements =
      this.stripe.elements();

    this.cardElement =
      this.elements.create(
        'card',
        {
          style: {

            base: {
              fontSize: '16px',
              color: '#212529'
            },

            invalid: {
              color: '#dc3545'
            }

          }
        }
      );

    setTimeout(() => {

      const container =
        document.getElementById(
          'card-element'
        );

      if (
        !container ||
        !this.cardElement
      ) {

        console.error(
          'Stripe card-element container not found'
        );

        return;

      }

      try {

        this.cardElement.mount(
          container
        );

      } catch (error) {

        console.error(
          'Stripe mount error:',
          error
        );

      }

    }, 0);

  }

  // =========================================
  // CONFIRM PAYMENT + CREATE ORDER
  // =========================================

  async confirmAndPay(
    basketId: string
  ): Promise<void> {

    // =======================================
    // VALIDATE FORM
    // =======================================
// =======================================
// VALIDATE FORM
// =======================================

if (this.form.controls.fName.invalid) {

  this.form.controls.fName.markAsTouched();

  this.toastService.show(
    'من فضلك أدخل الاسم الأول',
    'error'
  );

  return;
}

if (this.form.controls.lName.invalid) {

  this.form.controls.lName.markAsTouched();

  this.toastService.show(
    'من فضلك أدخل الاسم الأخير',
    'error'
  );

  return;
}

if (this.form.controls.street.invalid) {

  this.form.controls.street.markAsTouched();

  this.toastService.show(
    'من فضلك أدخل العنوان',
    'error'
  );

  return;
}

if (this.form.controls.city.invalid) {

  this.form.controls.city.markAsTouched();

  this.toastService.show(
    'من فضلك أدخل المدينة',
    'error'
  );

  return;
}

if (this.form.controls.country.invalid) {

  this.form.controls.country.markAsTouched();

  this.toastService.show(
    'من فضلك أدخل المحافظة',
    'error'
  );

  return;
}

if (this.form.controls.deliveryMethodId.invalid) {

  this.form.controls.deliveryMethodId.markAsTouched();

  this.toastService.show(
    'من فضلك اختر طريقة الشحن',
    'error'
  );

  return;
}

    const v =
      this.form.getRawValue();

    // =======================================
    // CASH ON DELIVERY
    // =======================================

    if (
      v.paymentMethod === 'cod'
    ) {

      this.processingPayment = true;

      this.paymentError = '';

      this.store.dispatch(

        OrdersActions.createOrder({

          payload: {

            basketId,

            deliveryMethodId:
              v.deliveryMethodId,

            // IMPORTANT
            paymentMethod:
              'CashOnDelivery',

            address: {

              fName:
                v.fName,

              lName:
                v.lName,

              street:
                v.street,

              city:
                v.city,

              government:
                v.country

            }

          }

        })

      );

      this.processingPayment = false;

      return;
    }

    // =======================================
    // CARD
    // =======================================

    if (
      !this.stripe ||
      !this.cardElement ||
      !this.clientSecret
    ) {

      this.paymentError =
        'وسيلة الدفع مش جاهزة لسه، استنى لحظة وحاول تاني';

      return;

    }

    this.processingPayment = true;

    this.paymentError = '';

    try {

      const result =
        await this.stripe
          .confirmCardPayment(

            this.clientSecret,

            {

              payment_method: {

                card:
                  this.cardElement,

                billing_details: {

                  name:
                    `${v.fName} ${v.lName}`

                }

              }

            }

          );

      // =====================================
      // STRIPE ERROR
      // =====================================

      if (result.error) {

        this.paymentError =
          result.error.message ??
          'فشلت عملية الدفع، تأكد من بيانات الكارت';

        this.toastService.show(
          this.paymentError,
          'error'
        );

        this.processingPayment =
          false;

        return;

      }

      // =====================================
      // PAYMENT SUCCESS
      // =====================================

      if (
        result.paymentIntent?.status ===
        'succeeded'
      ) {

        this.store.dispatch(

          OrdersActions.createOrder({

            payload: {

              basketId,

              deliveryMethodId:
                v.deliveryMethodId,

              // IMPORTANT
              paymentMethod:
                'Card',

              address: {

                fName:
                  v.fName,

                lName:
                  v.lName,

                street:
                  v.street,

                city:
                  v.city,

                government:
                  v.country

              }

            }

          })

        );

      } else {

        this.paymentError =
          'لم تكتمل عملية الدفع';

        this.toastService.show(
          this.paymentError,
          'error'
        );

      }

    } catch (error) {

      console.error(
        'Stripe confirmCardPayment error:',
        error
      );

      this.paymentError =
        'تعذر الاتصال بخادم الدفع (Stripe). جرّب تاني.';

      this.toastService.show(
        this.paymentError,
        'error'
      );

    } finally {

      this.processingPayment =
        false;

    }

  }

  // =========================================
  // LOAD ADDRESSES
  // =========================================

  loadAddresses(): void {

    this.loadingAddresses = true;

    this.addressService
      .getAllAddress()
      .subscribe({

        next: addresses => {

          console.log(
            'Saved Addresses:',
            addresses
          );

          this.savedAddresses =
            addresses;

          this.loadingAddresses =
            false;

          // Select first address automatically
          if (
            addresses.length > 0
          ) {

            this.useAddress(
              addresses[0]
            );

          }

        },

        error: error => {

          console.error(
            'Get Addresses Error:',
            error
          );

          this.loadingAddresses =
            false;

        }

      });

  }

  // =========================================
  // USE ADDRESS
  // =========================================

  useAddress(
    address: AddressDTO
  ): void {

    this.form.patchValue({

      addressId:
        address.id ?? 0,

      street:
        address.street,

      city:
        address.city,

      country:
        address.government

    });

  }

  // =========================================
  // LOAD DELIVERY METHODS
  // =========================================

  loadDeliveryMethods(): void {

    this.loadingDeliveryMethods =
      true;

    this.basketService
      .getDeliveryMethods()
      .subscribe({

        next: methods => {

          console.log(
            'Delivery Methods:',
            methods
          );

          this.deliveryMethods =
            methods;

          this.loadingDeliveryMethods =
            false;

          // Select first delivery method automatically
          if (
            methods.length > 0
          ) {

            this.selectDeliveryMethod(
              methods[0]
            );

          }

        },

        error: error => {

          console.error(
            'Get Delivery Methods Error:',
            error
          );

          this.loadingDeliveryMethods =
            false;

        }

      });

  }

  // =========================================
  // SELECT DELIVERY METHOD
  // =========================================

  selectDeliveryMethod(
    method: DeliveryMethodDTO
  ): void {

    this.selectedDeliveryMethod =
      method;

    this.selectedDeliveryMethod$
      .next(method);

    this.form.patchValue({

      deliveryMethodId:
        method.id

    });

  }

}