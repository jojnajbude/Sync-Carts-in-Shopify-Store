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
  items: any[];
}
