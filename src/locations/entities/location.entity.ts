import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Location extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  imei: string;
  @Column()
  latitude: string;
  @Column()
  longitude: string;
}
