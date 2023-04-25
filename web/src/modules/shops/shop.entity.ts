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

  @Column({ type: 'json', nullable: true })
  priorities: string;

  @Column({ type: 'json', nullable: true })
  email_templates: string;
}