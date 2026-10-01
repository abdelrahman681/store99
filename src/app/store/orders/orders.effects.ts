import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import {
  EMPTY,
  catchError,
  map,
  of,
  switchMap,
  tap
} from 'rxjs';

import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';

import { BasketActions } from '../basket/basket.actions';
import { apiErrorMessage } from '../../core/utils/api-error';
import { OrdersActions } from './orders.actions';

@Injectable()
export class OrdersEffects {

  private actions$ = inject(Actions);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private toastService = inject(ToastService);


  // =========================================================
  // CREATE ORDER SUCCESS TOAST
  // =========================================================

  showOrderSuccessToast$ = createEffect(
    () =>
      this.actions$.pipe(

        ofType(
          OrdersActions.createOrderSuccess
        ),

        tap(() => {

          this.toastService.show(
            'تم تأكيد الطلب بنجاح ✅',
            'success'
          );

        })

      ),

    { dispatch: false }
  );


  // =========================================================
  // CREATE ORDER FAILURE TOAST
  // =========================================================

  showOrderFailureToast$ = createEffect(
    () =>
      this.actions$.pipe(

        ofType(
          OrdersActions.createOrderFailure
        ),

        tap(({ error }) => {

          this.toastService.show(
            error,
            'error'
          );

        })

      ),

    { dispatch: false }
  );


  // =========================================================
  // CREATE ORDER
  // =========================================================

  createOrder$ = createEffect(() =>
    this.actions$.pipe(

      ofType(
        OrdersActions.createOrder
      ),

      switchMap(({ payload }) =>

        this.orderService
          .createOrder(payload)
          .pipe(

            map(order =>
              OrdersActions.createOrderSuccess({
                order
              })
            ),

            catchError(
              (err: HttpErrorResponse) =>

                of(
                  OrdersActions.createOrderFailure({
                    error:
                      err.error?.message ??
                      'تعذر إنشاء الطلب'
                  })
                )

            )

          )

      )

    )
  );


  // =========================================================
  // AFTER ORDER CREATED
  // =========================================================

  onOrderCreated$ = createEffect(() =>
    this.actions$.pipe(

      ofType(
        OrdersActions.createOrderSuccess
      ),

      tap(({ order }) => {

        this.router.navigate([
          '/orders',
          order.id
        ]);

      }),

      map(() =>
        BasketActions.clearBasket()
      )

    )
  );


  // =========================================================
  // LOAD ORDERS
  // =========================================================

  loadOrders$ = createEffect(() =>
    this.actions$.pipe(

      ofType(
        OrdersActions.loadOrders
      ),

      switchMap(
        ({
          pageIndex,
          pageSize
        }) =>

          this.orderService
            .getOrdersForUser(
              pageIndex,
              pageSize
            )
            .pipe(

              map(result =>
                OrdersActions.loadOrdersSuccess({
                  result
                })
              ),

              catchError(
                (err: HttpErrorResponse) =>

                  of(
                    OrdersActions.loadOrdersFailure({
                      error:
                        err.message ??
                        'تعذر تحميل الطلبات'
                    })
                  )

              )

            )

      )

    )
  );


  // =========================================================
  // LOAD SINGLE ORDER
  // =========================================================

  loadOrder$ = createEffect(() =>
    this.actions$.pipe(

      ofType(
        OrdersActions.loadOrder
      ),

      switchMap(({ id }) =>

        this.orderService
          .getOrderById(id)
          .pipe(

            map(order =>
              OrdersActions.loadOrderSuccess({
                order
              })
            ),

            catchError(
              (err: HttpErrorResponse) =>

                of(
                  OrdersActions.loadOrderFailure({
                    error:
                      err.message ??
                      'تعذر تحميل الطلب'
                  })
                )

            )

          )

      )

    )
  );


  // =========================================================
  // CANCEL ORDER
  // =========================================================

  cancelOrder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrdersActions.cancelOrder),
      switchMap(({ id }) =>
        this.orderService.cancelOrder(id).pipe(
          tap(() => this.toastService.show('تم إلغاء الطلب بنجاح ✅', 'success')),
          map(() => OrdersActions.cancelOrderSuccess({ id })),
          catchError((err: HttpErrorResponse) => {
            const message = apiErrorMessage(err, 'تعذر إلغاء الطلب');
            this.toastService.show(message, 'error');
            return of(OrdersActions.cancelOrderFailure({ error: message }));
          })
        )
      )
    )
  );

  // Silent refreshes used while waiting for the payment webhook (errors are ignored on purpose)
  refreshOrder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrdersActions.refreshOrder),
      switchMap(({ id }) =>
        this.orderService.getOrderById(id).pipe(
          map(order => OrdersActions.refreshOrderSuccess({ order })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  refreshOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrdersActions.refreshOrders),
      switchMap(({ pageIndex, pageSize }) =>
        this.orderService.getOrdersForUser(pageIndex, pageSize).pipe(
          map(result => OrdersActions.refreshOrdersSuccess({ result })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  // =========================================================
  // REFRESH ORDERS AFTER CANCEL
  // =========================================================

  refreshOrdersAfterCancel$ = createEffect(() =>
    this.actions$.pipe(

      ofType(
        OrdersActions.cancelOrderSuccess
      ),

      tap(() => {

        console.log(
          'Order cancelled successfully - refreshing orders...'
        );

      }),

      map(() =>
        OrdersActions.loadOrders({
          pageIndex: 1,
          pageSize: 10
        })
      )

    )
  );

}