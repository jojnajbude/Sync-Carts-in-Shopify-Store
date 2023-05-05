import { json } from "stream/consumers";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  domain: string;

  @Column({ type: 'bigint' })
  shopify_id: number;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  session: string;

  @Column({ nullable: true })
  currency: string;

  @Column({ default: 'free' })
  plan: string;

  @Column({ nullable: true, type: 'bigint' })
  charge_id: number;

  @Column({ default: 0 })
  carts: number;

  @Column({ default: 50 })
  limit: number;

  @Column({ default: 'active' })
  status: string;

  @Column({ type: 'json', nullable: true })
  priorities: string;

  @Column({ type: 'json', nullable: true })
  cart_reminder_html: string;

  @Column({ type: 'json', nullable: true })
  cart_updated_html: string;

  @Column({ type: 'json', nullable: true })
  expiring_soon_html: string;

  @Column({ type: 'json', nullable: true })
  expired_items_html: string;

  @Column({ type: 'json', nullable: true })
  cart_reminder_json: string;

  @Column({ type: 'json', nullable: true })
  cart_updated_json: string;

  @Column({ type: 'json', nullable: true })
  expiring_soon_json: string;

  @Column({ type: 'json', nullable: true })
  expired_items_json: string;
}