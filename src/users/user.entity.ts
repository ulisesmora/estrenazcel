import { Credit } from 'src/credits/credit.entity';
import {
    BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Relation, UpdateDateColumn
} from 'typeorm'


@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    firstName: string;
    @Column()
    lastName: string;
    @Column()
    secondName: string;
    @Column({ unique: true })
    clientEmail: string;
    @Column({ unique: true })
    clientPhoneNumber: string;
    @Column({ unique: true })
    clientCurp: string;
    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created: Date;
    @UpdateDateColumn({
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      onUpdate: 'CURRENT_TIMESTAMP',
    })
    modified: Date;
    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted: Date;
    @OneToMany(() => Credit, (credit) => credit.user, {
        eager: false,
      })
      credit: Relation<Credit>[];
}