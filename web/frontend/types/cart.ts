export interface Cart {
  id: number;
  customer_name: string;
  total: number;
  reserved_indicator: string;
  reservation_time: string;
  qty: number;
  items: any[];
}
