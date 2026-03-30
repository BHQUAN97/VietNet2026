import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { generateUlid } from '../../../common/helpers/ulid.helper';
import { User } from '../../users/entities/user.entity';

@Entity('page_configs')
export class PageConfig {
  @PrimaryColumn({ type: 'char', length: 26 })
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  page_slug!: string;

  @Column({ type: 'json', nullable: true })
  config_draft!: Record<string, unknown> | null;

  @Column({ type: 'json', nullable: true })
  config_published!: Record<string, unknown> | null;

  @Column({ type: 'int', unsigned: true, default: 0 })
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

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @Column({ type: 'char', length: 26, nullable: true })
  updated_by!: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updater!: User | null;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = generateUlid();
    }
  }
}
