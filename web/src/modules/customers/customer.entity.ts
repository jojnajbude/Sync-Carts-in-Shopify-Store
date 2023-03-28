import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  shop_id: number;

  @Column({ nullable: true })
  name?: string;

  @Column({ type: 'bigint' })
  shopify_user_id: number;

  @Column({ default: 'normal' })
  priority: string;

  @Column()
  cart_id: string
}