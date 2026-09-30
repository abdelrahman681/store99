export interface ShippingAddress {
  fName: string;
  lName: string;
  city: string;
  street: string;
  government: string;
}
export interface AddressDTO {
  id?: number;
  city: string;
  street: string;
  government: string;
}
