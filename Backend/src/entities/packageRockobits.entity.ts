import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('package_rockobits')
export class PackageRockobits {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  rockobitsAmount: number;

  @Column()
  price: number;

  @Column()
  currency: string;

  @Column()
  priceId: string; // stripe price id


}
