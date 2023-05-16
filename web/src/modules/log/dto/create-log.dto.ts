export class CreateLogDto {
  domain: string;
  type: string;
  date: Date;
  customer_name?: string | null;
  product_name?: string;
  link_id?: string;
  qty?: number | string;
  cart_id?: number;
}
