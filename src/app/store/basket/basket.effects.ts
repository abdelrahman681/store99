import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import {
  catchError,
  filter,
  map,
  of,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs';

import { BasketService } from '../../core/services/basket.service';
import { ToastService } from '../../core/services/toast.service';
import { createEmptyBasket } from '../../core/models/basket.model';
import { BasketActions } from './basket.actions';
import { selectBasket } from './basket.selectors';

@Injectable()
export class BasketEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private basketService = inject(BasketService);
  private toastService = inject(ToastService);

  // ==============================
  // Add to basket toast
  // ==============================
  showAddedToBasketToast$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(BasketActions.addItemToBasket),
        tap(({ item }) =>
          this.toastService.show(
            `تمت إضافة "${item.name}" إلى السلة 🛒`,
            'success'
          )
        )
      ),
    { dispatch: false }
  );

  // ==============================
  // Load Basket
  // ==============================
  loadBasket$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BasketActions.loadBasket),

      switchMap(() =>
        this.basketService.getBasket().pipe(
  map(basket =>
  BasketActions.loadBasketSuccess({
    basket
  })
),

          catchError(error => {
            console.error('Load Basket Error:', error);

            return of(BasketActions.loadBasketFailure());
          })
        )
      )
    )
  );

  // ==============================
  // Local changes -> Sync
  // ==============================
  syncOnChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        BasketActions.addItemToBasket,
        BasketActions.incrementItemQuantity,
        BasketActions.decrementItemQuantity,
        BasketActions.removeItemFromBasket,
        BasketActions.setDeliveryMethod
      ),
      map(() => BasketActions.syncBasket())
    )
  );

  // ==============================
  // Sync Basket
  // ==============================
  syncBasket$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BasketActions.syncBasket),

      withLatestFrom(this.store.select(selectBasket)),

      filter(([, basket]) => !!basket),

      switchMap(([, basket]) =>
        this.basketService.updateBasket(basket!).pipe(
          map(updated =>
            BasketActions.syncBasketSuccess({
              basket: updated
            })
          ),

          catchError((err: HttpErrorResponse) =>
            of(
              BasketActions.syncBasketFailure({
                error: err.message ?? 'تعذر تحديث السلة'
              })
            )
          )
        )
      )
    )
  );

  // ==============================
  // Sync error toast
  // ==============================
  showSyncErrorToast$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(BasketActions.syncBasketFailure),

        tap(({ error }) =>
          this.toastService.show(error, 'error')
        )
      ),
    { dispatch: false }
  );

  // ==============================
  // Clear Basket
  // ==============================
  // clearBasket$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(BasketActions.clearBasket),

  //     switchMap(() =>
  //       this.basketService.deleteBasket().pipe(
  //         map(() => BasketActions.clearBasketSuccess()),

  //         catchError(error => {
  //           console.error('Delete Basket Error:', error);

  //           // حتى لو Redis delete فشل،
  //           // لازم نمسح الـ basket من الـ frontend
  //           return of(BasketActions.clearBasketSuccess());
  //         })
  //       )
  //     )
  //   )
  // );
}