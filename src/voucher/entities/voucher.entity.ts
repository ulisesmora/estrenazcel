import { Company } from 'src/company/entities/company.entity';
import { Credit } from 'src/credits/credit.entity';
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
  export class Voucher extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    payment_date: string;
    @Column()
    code: string;
    @Column({ nullable: true })
    codeLated: string;
    @Column({ type: 'float', nullable: true })
    amount: number;
    @Column({ type: 'float', nullable: true })
    amountRetarded: number;
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
    @ManyToOne(() => Credit, (credit) => credit.voucher, {
        eager: false,
    })
    credit: Relation<Credit>;
    @ManyToOne(() => Company, (company) => company.voucher, {
        eager: false,
      })
      company: Relation<Company>;
  }