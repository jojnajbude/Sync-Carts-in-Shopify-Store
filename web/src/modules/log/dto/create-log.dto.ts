export class CreateLogDto {
  domain: string;
  type: string;
  date: Date;
  customer_name?: string;
  product_name?: string;
  link_id?: string;
}
