import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  variant_id: number;

  @Column({ type: 'bigint' })
  qty: number;

  @Column({ nullable: true })
  cart_id: string;

  @Column({ type: 'bigint' })
  customer: number;

  @Column({ type: 'bigint' })
  shop: number;

  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ default: 'reserved' })
  status: string;
}