import { createActionGroup, props } from '@ngrx/store';
import { Pagination } from '../../core/models/pagination.model';
import { OrderPayload, OrderToReturn } from '../../core/models/order.model';

export const OrdersActions = createActionGroup({
  source: 'Orders',
  events: {
    'Create Order': props<{ payload: OrderPayload }>(),
    'Create Order Success': props<{ order: OrderToReturn }>(),
    'Create Order Failure': props<{ error: string }>(),

    'Load Orders': props<{ pageIndex?: number; pageSize?: number }>(),
    'Load Orders Success': props<{ result: Pagination<OrderToReturn> }>(),
    'Load Orders Failure': props<{ error: string }>(),

    'Load Order': props<{ id: number }>(),
    'Load Order Success': props<{ order: OrderToReturn }>(),
    'Load Order Failure': props<{ error: string }>(),

    'Refresh Order': props<{ id: number }>(),
    'Refresh Order Success': props<{ order: OrderToReturn }>(),
    'Refresh Orders': props<{ pageIndex?: number; pageSize?: number }>(),
    'Refresh Orders Success': props<{ result: Pagination<OrderToReturn> }>(),
    'Cancel Order': props<{ id: number }>(),
    'Cancel Order Success': props<{ id: number }>(),
    'Cancel Order Failure': props<{ error: string }>(),
  }
});
