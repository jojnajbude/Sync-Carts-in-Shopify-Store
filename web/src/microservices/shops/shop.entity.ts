import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Shops {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;
}