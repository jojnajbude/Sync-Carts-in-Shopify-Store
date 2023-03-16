import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customer_id: number;

  @Column()
  qty: number;
  
  @Column()
  state: string;
  
  @Column()
  total: number;

  @Column()
  customer_name: string

  @Column()
  email: string;

  @Column()
  reserved_indicator: string;
}