export interface Product {
  id: number;
  name: string;
  description: string;
  pictureUrl: string;
  brandName: string | null;
  categoryName: string | null;
  price: number;
  stockQuantity: number;
  averageRating: number;
  reviewsCount: number;
}

export type SortOption = 'PriceAsc' | 'PriceDesc' | 'NameAsc' | 'NameDesc';

export interface ProductQueryParams {
  sort?: SortOption;
  productBrandId?: number;
  productCategoryId?: number;
  pageIndex?: number;
  pageSize?: number;
  searchValue?: string;
}
export interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  pictureUrl: string;
}
export interface WishlistProduct {
  id: number;
  name: string;
  description: string;
  pictureUrl: string;
  brandName: string;
  categoryName: string;
  price: number;
  stockQuantity: number;
  averageRating: number;
  reviewsCount: number;
}

export interface WishlistData {
  productId: number;
  createdAt: string;
  product: WishlistProduct;
}

export interface WishlistPagination {
  pageSize: number;
  pageIndex: number;
  countOfSpec: number;
  totalPages: number;
  countOfAllItem: number;
  data: WishlistData[];
}