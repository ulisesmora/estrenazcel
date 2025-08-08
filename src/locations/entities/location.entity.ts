import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Location extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  imei: string;
  @Column({type: 'float'})
  latitude: number;
  @Column({type: 'float'})
  longitude: number;
}
