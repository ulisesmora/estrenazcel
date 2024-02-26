import { Sucursal } from 'src/sucursal/entities/sucursal.entity';
import { User } from 'src/users/user.entity';
import { Voucher } from 'src/voucher/entities/voucher.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Credit extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'float' })
  credit_amount: number;
  @Column({ type: 'float', nullable: true })
  hitch_amount: string;
  @Column()
  branch_phone: string;
  @Column()
  model_phone: string;
  @Column()
  pending_payments: number;
  @Column({ type: 'float', nullable: true })
  current_balance: number;
  @Column({ unique: true })
  imei: string;
  @Column({ type: 'float', nullable: true })
  weekly_payment: number;
  @Column({ nullable: true })
  weekly_day_payment: string;
  @CreateDateColumn({ type: 'timestamp' })
  created: Date;
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  modified: Date;
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted: Date;
  @ManyToOne(() => User, (user) => user.credit, {
    eager: false,
  })
  user: Relation<User>;
  @ManyToOne(() => Sucursal, (sucursal) => sucursal.credit, {
    eager: false,
  })
  sucursal: Relation<Sucursal>;

  @OneToMany(() => Voucher, (voucher) => voucher.credit, {
    eager: false,
  })
  voucher: Relation<Voucher>[];
}
