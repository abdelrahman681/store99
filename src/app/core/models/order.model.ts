import { ShippingAddress } from './address.model';

export interface ItemOrder {
  price: number;
  productId: number;
  quantity: number;
  pictureUrl: string | null;
  productName: string | null;
}

export interface OrderPayload {
  basketId: string;
  deliveryMethodId: number;
  address: ShippingAddress;
  paymentMethod: 'Card' | 'CashOnDelivery';

}

export interface OrderToReturn {
  id: number;
  buyerEmail: string;
  dateOfCreate: string;
  status: string;
  address: ShippingAddress;
  deliveryMethod: string;
  deliveryMethodCost: string;
  items: ItemOrder[];
  subTotal: number;
  total: number;
  paymentIntentId: string | null;
  paymentMethod: 'Card' | 'CashOnDelivery';

}

export interface UpdateOrderPayload {
  shippingAddress: ShippingAddress;
  deliveryMethodId: number;
  status: number;
}