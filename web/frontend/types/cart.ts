export interface Cart {
  id: number;
  customer_name: string;
  customer_shopify_id: string;
  priority: 'max' | 'high' | 'normal' | 'low' | 'min';
  shop_domain: string;
  total: number;
  reserved_indicator: 'all' | 'part' | 'no' | 'unsynced' | 'paid';
  reservation_time: string;
  qty: number;
  items: Item[];
  last_action: string;
}

export interface Item {
  cart_id: number;
  created_at: Date;
  expire_at: Date;
  id: number;
  price: string;
  name: string | null;
  qty: string | number;
  status: string;
  variant_id: string | number;
  product_id: string | number;
  title: string;
  image_link: string;
  reserved_indicator: string;
}
