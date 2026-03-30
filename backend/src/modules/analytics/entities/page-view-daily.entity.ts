import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('page_view_daily')
@Unique(['page_path', 'view_date'])
export class PageViewDaily {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ type: 'varchar', length: 500 })
  page_path!: string;

  @Column({ type: 'date' })
  view_date!: string;

  @Column({ type: 'int', unsigned: true, default: 0 })
  total_views!: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  unique_visitors!: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  mobile_views!: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  desktop_views!: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  tablet_views!: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  bot_views!: number;
}
