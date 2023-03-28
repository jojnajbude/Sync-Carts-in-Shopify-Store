import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  customer_id: number;

  @Column({ type: 'bigint' })
  shop_id: number;

  @Column()
  cart_token: string;
}