import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  shop_id: number;

  @Column()
  name: string;

  @Column()
  shopify_user_id: number;

  @Column()
  priority: string;

  @Column()
  cart_id: string
}