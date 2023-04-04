export interface Item {
  cart_id: number;
  createdAt: Date;
  id: number;
  price: string;
  name: string | null;
  qty: string;
  status: string;
  variant_id: string;
}
