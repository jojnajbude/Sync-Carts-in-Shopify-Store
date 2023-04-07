import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Cart } from "../carts/cart.entity.js";

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  variant_id: number;

  @Column({ type: 'bigint' })
  qty: number;

  @Column({ nullable: true })
  cart_id: number;

  @ManyToOne((type) => Cart)
  @JoinColumn({ name: 'cart_id', referencedColumnName: 'id' })
  cart: Cart;

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ default: 'reserved' })
  status: string;

  @Column()
  price: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  image_link: string;
}