export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  orders_count: number;
  phone: string;
  email: string;
  default_address: Address;
  itemDropRate: number;
  itemDropCount: number;
  priority: 'max' | 'high' | 'normal' | 'low' | 'min';
}

export interface Address {
  address1: string;
  city: string;
  country: string;
  zip: string;
}
