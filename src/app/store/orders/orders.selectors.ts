import { createFeatureSelector, createSelector } from '@ngrx/store';

import {
  OrdersState,
  ordersFeatureKey
} from './orders.reducer';

export const selectOrdersState =
  createFeatureSelector<OrdersState>(ordersFeatureKey);

export const selectAllOrders =
  createSelector(
    selectOrdersState,
    s => s.items
  );

export const selectSelectedOrder =
  createSelector(
    selectOrdersState,
    s => s.selected
  );

export const selectOrdersLoading =
  createSelector(
    selectOrdersState,
    s => s.loading
  );

export const selectOrdersError =
  createSelector(
    selectOrdersState,
    s => s.error
  );

export const selectOrdersCurrentPage =
  createSelector(
    selectOrdersState,
    s => s.currentPage
  );

export const selectOrdersPageSize =
  createSelector(
    selectOrdersState,
    s => s.pageSize
  );

export const selectOrdersTotalPages =
  createSelector(
    selectOrdersState,
    s => s.totalPages
  );