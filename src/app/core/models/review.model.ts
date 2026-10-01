/**
 * ReviewToReturnDTO as the API sends it. Only id / rating / comment are certain; the author and date
 * fields are optional because their exact names depend on the backend DTO.
 */
export interface Review {
  id: number;
  rating: number;
  comment?: string | null;
  productId?: number;
  userName?: string | null;
  displayName?: string | null;
  userEmail?: string | null;
  email?: string | null;
  buyerEmail?: string | null;
  createdAt?: string | null;
  dateOfCreate?: string | null;
  date?: string | null;
  [key: string]: any;
}

export interface ReviewsPage {
  pageIndex: number;
  pageSize: number;
  countOfAllItem: number;
  data: Review[];
}

export interface AddReviewPayload { productId: number; rating: number; comment: string; }
export interface UpdateReviewPayload { id: number; rating: number; comment: string; }
