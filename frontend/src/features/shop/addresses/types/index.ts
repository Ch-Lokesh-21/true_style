// ============ Address Types ============
export interface UserAddress {
  _id?: string;
  user_id?: string;
  mobile_no: string;
  postal_code: number;
  country: string;
  state: string;
  city: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserAddressForm {
  mobile_no: string;
  postal_code: number;
  country: string;
  state: string;
  city: string;
  address: string;
}
