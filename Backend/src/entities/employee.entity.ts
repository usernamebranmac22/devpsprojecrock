// employee.entity.ts

import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Wallet } from "./wallet.entity";
import { ROLES } from "src/constants";

@Entity("employee")
export class Employee extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "varchar", nullable: true })
  lastName: string;

  @Column({ type: "varchar", nullable: false, unique: true })
  email: string;

  @Column({ type: "varchar", nullable: false })
  password: string;

  @Column({ type: "varchar", nullable: false })
  phone: string;

  @Column({ type: "varchar", nullable: true })
  address: string;

  @Column({ nullable: false, default: true })
  active: boolean;

  @Column({ type: "enum", enum: ROLES, default: ROLES.EMPLEADOS })
  type: ROLES;
  
  @ManyToOne(() => User, (user) => user.employees)
  user: User;

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  @JoinColumn()
  wallet: Wallet;
}
