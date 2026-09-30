import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BasketState, basketFeatureKey } from './basket.reducer';

export const selectBasketState = createFeatureSelector<BasketState>(basketFeatureKey);

export const selectBasket = createSelector(selectBasketState, s => s.basket);
export const selectBasketItems = createSelector(selectBasket, basket => basket?.items ?? []);
export const selectBasketItemsCount = createSelector(selectBasketItems, items =>
  items.reduce((sum, i) => sum + i.quantity, 0)
);
export const selectBasketSubTotal = createSelector(selectBasketItems, items =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0)
);
