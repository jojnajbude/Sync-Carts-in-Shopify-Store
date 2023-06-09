import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Shop } from "../shops/shop.entity.js";

@Entity('analytics')
export class Analytics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  shop_id: number;

  @ManyToOne(() => Shop,  { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shop_id', referencedColumnName: 'id'})
  shop: Shop;

  @Column({ nullable: true })
  type: string;

  @Column({ type: 'json' })
  value: string; 

  @Column()
  date: Date;
}