export interface Cart {
  id: number;
  customer_name: string;
  customer_shopify_id: string;
  priority: 'max' | 'high' | 'normal' | 'low' | 'min';
  shop_domain: string;
  total: number;
  reserved_indicator: string;
  reservation_time: string;
  qty: number;
  items: Item[];
}

export interface Item {
  cart_id: number;
  createdAt: Date;
  expireAt: Date;
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
