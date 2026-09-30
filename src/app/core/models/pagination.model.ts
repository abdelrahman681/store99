export interface Pagination<T> {
  pageSize: number;
  pageIndex: number;
  countOfSpec: number;
  totalPages: number;
  countOfAllItem: number;
  data: T[];
}


export enum Sorting {
  PriceAsc = 'PriceAsc',
  PriceDesc = 'PriceDesc',
  NameAsc = 'NameAsc',
  NameDesc = 'NameDesc'
}

export interface ErrorApiResponse {
  statusCode: number;
  message: string;
}

export interface PagingParams {
  pageIndex?: number;
  pageSize?: number;
}
