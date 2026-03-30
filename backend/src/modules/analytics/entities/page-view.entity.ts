import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum DeviceType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
}

@Entity('page_views')
export class PageView {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ type: 'varchar', length: 500 })
  page_path!: string;

  @Column({ type: 'varchar', length: 45 })
  visitor_ip!: string;

  @Column({ type: 'text', nullable: true })
  user_agent!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  referrer!: string | null;

  @Column({ type: 'enum', enum: DeviceType, nullable: true })
  device_type!: DeviceType | null;

  @Column({ type: 'tinyint', width: 1, default: false })
  is_bot!: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  session_id!: string | null;

  @Column({ type: 'timestamp' })
  viewed_at!: Date;
}
