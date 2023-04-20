import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Customer } from "../customers/customer.entity.js";
import { Shop } from "../shops/shop.entity.js";

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', nullable: true})
  customer_id: number;

  @ManyToOne((type) => Customer)
  @JoinColumn({ name: 'customer_id', referencedColumnName: 'id'})
  customer: Customer;

  @Column({ type: 'bigint' })
  shop_id: number;

  @ManyToOne((type) => Shop)
  @JoinColumn({ name: 'shop_id', referencedColumnName: 'id'})
  shop: Shop;

  @Column({ nullable: true })
  cart_token: string;

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP", nullable: true })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  closed_at: Date;

  @Column({ type: 'numeric', nullable: true })
  final_price: number;
}