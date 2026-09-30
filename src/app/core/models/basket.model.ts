export interface BasketItem {
  id: number;
  productId: number;
  name: string;
  pictureUrl: string;
  brand: string;
  category: string;
  price: number;
  quantity: number;
}

export interface CustomerBasket {
  id: string;
  deliveryMethodId: number | null;
  paymentIntentId: string | null;
  clientSecret: string | null;
  email: string | null;
  items: BasketItem[];
}

export function createEmptyBasket(id: string): CustomerBasket {
  return { id, deliveryMethodId: null, paymentIntentId: null, clientSecret: null, email: null, items: [] };
}
