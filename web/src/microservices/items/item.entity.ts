import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  variant_id:number;

  @Column()
  qty: number;

  @Column()
  cart_id: number;
}