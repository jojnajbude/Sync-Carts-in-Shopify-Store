import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  domain: string;

  @Column({ type: 'bigint' })
  shopify_id: number;

  @Column({ type: 'varchar', nullable: true })
  session: string;

  @Column({ nullable: true })
  currency: string;
}