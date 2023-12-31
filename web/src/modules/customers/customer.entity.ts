import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Shop } from "../shops/shop.entity.js";

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  shop_id: number;

  @ManyToOne(() => Shop, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shop_id', referencedColumnName: 'id'})
  shop: Shop;

  @Column({ nullable: true })
  name?: string;

  @Column({ type: 'bigint' })
  shopify_user_id: number;

  @Column({ default: 'normal' })
  priority: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  location: string;
}