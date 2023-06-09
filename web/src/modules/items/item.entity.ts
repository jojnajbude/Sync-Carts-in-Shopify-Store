import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Cart } from "../carts/cart.entity.js";

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  variant_id: number;

  @Column({ type: 'bigint' })
  qty: number;

  @Column({ type: 'bigint', nullable: true })
  cart_id: number;

  @ManyToOne((type) => Cart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id', referencedColumnName: 'id' })
  cart: Cart;

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @Column({ type: 'timestamp' })
  expire_at: Date;

  @Column({ default: 'reserved' })
  status: string;

  @Column()
  price: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  image_link: string;

  @Column({ type: 'bigint', nullable: true })
  product_id: number;

  @Column({ nullable: true })
  variant_title: string;
}