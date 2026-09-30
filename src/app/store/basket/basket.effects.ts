import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, filter, map, of, switchMap, tap, withLatestFrom } from 'rxjs';
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

  // Fires from anywhere in the app (product list, product detail, dashboard...)
  showAddedToBasketToast$ = createEffect(() => this.actions$.pipe(
    ofType(BasketActions.addItemToBasket),
    tap(({ item }) => this.toastService.show(`تمت إضافة "${item.name}" إلى السلة 🛒`, 'success'))
  ), { dispatch: false });

loadBasket$ = createEffect(() => this.actions$.pipe(

  ofType(BasketActions.loadBasket),

  switchMap(() => {

    const id = this.basketService.getOrCreateBasketId();

    return this.basketService.getBasket(id).pipe(

      map(basket =>
        BasketActions.loadBasketSuccess({
          basket: basket ?? createEmptyBasket(id)
        })
      ),

      catchError(error => {

        console.error('Load Basket Error:', error);

        return of(
          BasketActions.loadBasketFailure()
        );

      })

    );

  })

));

  // Any local mutation triggers a sync to the API with the latest state.
  syncOnChange$ = createEffect(() => this.actions$.pipe(
    ofType(
      BasketActions.addItemToBasket,
      BasketActions.incrementItemQuantity,
      BasketActions.decrementItemQuantity,
      BasketActions.removeItemFromBasket,
      BasketActions.setDeliveryMethod,
    ),
    map(() => BasketActions.syncBasket())
  ));

  syncBasket$ = createEffect(() => this.actions$.pipe(
    ofType(BasketActions.syncBasket),
    withLatestFrom(this.store.select(selectBasket)),
    filter(([, basket]) => !!basket),
    switchMap(([, basket]) => this.basketService.updateBasket(basket!).pipe(
      map(updated => BasketActions.syncBasketSuccess({ basket: updated })),
      catchError((err: HttpErrorResponse) => of(BasketActions.syncBasketFailure({
        error: err.message ?? 'تعذر تحديث السلة'
      })))
    ))
  ));

  showSyncErrorToast$ = createEffect(() => this.actions$.pipe(
    ofType(BasketActions.syncBasketFailure),
    tap(({ error }) => this.toastService.show(error, 'error'))
  ), { dispatch: false });

  clearBasket$ = createEffect(() => this.actions$.pipe(
    ofType(BasketActions.clearBasket),
    withLatestFrom(this.store.select(selectBasket)),
    filter(([, basket]) => !!basket),
    switchMap(([, basket]) => this.basketService.deleteBasket(basket!.id).pipe(
      tap(() => this.basketService.clearBasketId()),
      map(() => BasketActions.clearBasketSuccess())
    ))
  ));
}
