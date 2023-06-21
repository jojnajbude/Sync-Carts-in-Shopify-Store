export interface Product {
  image: Image;
  images: Image[];
  variants: Variant[];
}

export interface Variant {
  id: number;
  title: string;
  inventory_quantity: number;
  price: string;
  image_id: number;
  image_link: string;
  inventory_policy?: string;
}

export interface Image {
  id: number;
  src: string;
}
