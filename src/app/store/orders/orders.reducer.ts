import { createReducer, on } from '@ngrx/store';

import { OrderToReturn } from '../../core/models/order.model';

import { OrdersActions } from './orders.actions';

export interface OrdersState {

  items: OrderToReturn[];

  selected: OrderToReturn | null;

  lastCreated: OrderToReturn | null;

  loading: boolean;

  error: string | null;

  currentPage: number;

  pageSize: number;

  totalPages: number;
}

export const ordersFeatureKey = 'orders';

export const initialState: OrdersState = {

  items: [],

  selected: null,

  lastCreated: null,

  loading: false,

  error: null,

  currentPage: 1,

  pageSize: 10,

  totalPages: 0
};

export const ordersReducer = createReducer(

  initialState,

  on(
    OrdersActions.createOrder,
    state => ({
      ...state,
      loading: true,
      error: null
    })
  ),

  on(
    OrdersActions.createOrderSuccess,
    (state, { order }) => ({
      ...state,
      lastCreated: order,
      loading: false
    })
  ),

  on(
    OrdersActions.createOrderFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error
    })
  ),

  on(
    OrdersActions.loadOrders,
    state => ({
      ...state,
      loading: true,
      error: null
    })
  ),

  on(
    OrdersActions.loadOrdersSuccess,
    (state, { result }) => ({
      ...state,
      items: result.data,
      currentPage: result.pageIndex,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      loading: false
    })
  ),

  on(
    OrdersActions.loadOrdersFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error
    })
  ),

  on(
    OrdersActions.loadOrder,
    state => ({
      ...state,
      loading: true,
      selected: null
    })
  ),

  on(
    OrdersActions.loadOrderSuccess,
    (state, { order }) => ({
      ...state,
      selected: order,
      loading: false
    })
  ),

  on(
    OrdersActions.loadOrderFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error
    })
  ),

  on(
    OrdersActions.cancelOrderSuccess,
    (state, { id }) => ({
      ...state,
      items: state.items.map(
        o => o.id === id
          ? { ...o, status: 'Cancelled' }
          : o
      )
    })
  )

);