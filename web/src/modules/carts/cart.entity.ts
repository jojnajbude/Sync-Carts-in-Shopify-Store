import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Customer } from "../customers/customer.entity.js";
import { Shop } from "../shops/shop.entity.js";

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true})
  customer_id: number;

  @ManyToOne((type) => Customer)
  @JoinColumn({ name: 'customer_id', referencedColumnName: 'id'})
  customer: Customer;

  @Column()
  shop_id: number;

  @ManyToOne((type) => Shop)
  @JoinColumn({ name: 'shop_id', referencedColumnName: 'id'})
  shop: Shop;

  @Column({nullable: true})
  cart_token: string;
}