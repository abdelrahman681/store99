import { createReducer, on } from '@ngrx/store';
import { CustomerBasket, createEmptyBasket } from '../../core/models/basket.model';
import { BasketActions } from './basket.actions';

export interface BasketState {
  basket: CustomerBasket | null;
  loading: boolean;
  error: string | null;
}

export const basketFeatureKey = 'basket';

export const initialState: BasketState = {
  basket: null,
  loading: false,
  error: null,
};

export const basketReducer = createReducer(
  initialState,

  on(BasketActions.loadBasket, state => ({ ...state, loading: true })),
  on(BasketActions.loadBasketSuccess, (state, { basket }) => ({ ...state, basket, loading: false })),
  on(BasketActions.loadBasketFailure, state => ({ ...state, loading: false })),

on(BasketActions.addItemToBasket, (state, { item, quantity }) => {

  if (!state.basket) {
    return state;
  }

  const basket = state.basket;

  const qty = quantity ?? 1;

  const existing = basket.items.find(
    i => i.productId === item.productId
  );

  const items = existing
    ? basket.items.map(i =>
        i.productId === item.productId
          ? {
              ...i,
              quantity: i.quantity + qty
            }
          : i
      )
    : [
        ...basket.items,
        {
          ...item,
          quantity: qty
        }
      ];

  return {
    ...state,
    basket: {
      ...basket,
      items
    }
  };
}),

on(BasketActions.incrementItemQuantity, (state, { productId }) => {
  if (!state.basket) return state;

  const items = state.basket.items.map(item => {
    if (item.productId !== productId) {
      return item;
    }

    console.log(
      'Product:',
      item.name,
      'Quantity:',
      item.quantity,

    );


    return {
      ...item,
      quantity: item.quantity + 1
    };
  });

  return {
    ...state,
    basket: {
      ...state.basket,
      items
    }
  };
}),
  on(BasketActions.decrementItemQuantity, (state, { productId }) => {
    if (!state.basket) return state;
    const items = state.basket.items
      .map(i => i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i)
      .filter(i => i.quantity > 0);
    return { ...state, basket: { ...state.basket, items } };
  }),

  on(BasketActions.removeItemFromBasket, (state, { productId }) => {
    if (!state.basket) return state;
    const items = state.basket.items.filter(i => i.productId !== productId);
    return { ...state, basket: { ...state.basket, items } };
  }),

  on(BasketActions.setDeliveryMethod, (state, { deliveryMethodId }) => {
    if (!state.basket) return state;
    return { ...state, basket: { ...state.basket, deliveryMethodId } };
  }),

  on(BasketActions.syncBasketSuccess, (state, { basket }) => ({ ...state, basket, error: null })),
  on(BasketActions.syncBasketFailure, (state, { error }) => ({ ...state, error })),

  on(BasketActions.clearBasketSuccess, () => initialState),
);
