import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { BasketItem, CustomerBasket } from '../../core/models/basket.model';

export const BasketActions = createActionGroup({
  source: 'Basket',
  events: {
    'Load Basket': emptyProps(),
    'Load Basket Success': props<{ basket: CustomerBasket }>(),
    'Load Basket Failure': emptyProps(),

    'Add Item To Basket': props<{ item: BasketItem; quantity?: number }>(),
    'Increment Item Quantity': props<{ productId: number }>(),
    'Decrement Item Quantity': props<{ productId: number }>(),
    'Remove Item From Basket': props<{ productId: number }>(),
    'Set Delivery Method': props<{ deliveryMethodId: number }>(),

    'Sync Basket': emptyProps(),
    'Sync Basket Success': props<{ basket: CustomerBasket }>(),
    'Sync Basket Failure': props<{ error: string }>(),

    'Clear Basket': emptyProps(),
    'Clear Basket Success': emptyProps(),
  }
});
