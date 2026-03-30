import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { generateUlid } from '../../../common/helpers/ulid.helper';
import { PageConfig } from './page-config.entity';
import { User } from '../../users/entities/user.entity';

@Entity('page_config_history')
export class PageConfigHistory {
  @PrimaryColumn({ type: 'char', length: 26 })
  id!: string;

  @Column({ type: 'char', length: 26 })
  page_config_id!: string;

  @ManyToOne(() => PageConfig, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'page_config_id' })
  page_config!: PageConfig;

  @Column({ type: 'json' })
  config_snapshot!: Record<string, unknown>;

  @Column({ type: 'int', unsigned: true })
  version!: number;

  @Column({ type: 'timestamp', nullable: true })
  published_at!: Date | null;

  @Column({ type: 'char', length: 26, nullable: true })
  published_by!: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'published_by' })
  publisher!: User | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = generateUlid();
    }
  }
}
