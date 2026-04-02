import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  BeforeInsert,
  Index,
} from 'typeorm';
import { generateUlid } from '../../../common/helpers/ulid.helper';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
}

@Entity('app_logs')
export class AppLog {
  @PrimaryColumn({ type: 'char', length: 26 })
  id!: string;

  @Index()
  @Column({ type: 'enum', enum: LogLevel, default: LogLevel.INFO })
  level!: LogLevel;

  @Column({ type: 'varchar', length: 500 })
  message!: string;

  @Column({ type: 'text', nullable: true })
  stack_trace!: string | null;

  /** HTTP method + path, e.g. "POST /api/media/upload" */
  @Column({ type: 'varchar', length: 255, nullable: true })
  endpoint!: string | null;

  @Column({ type: 'smallint', nullable: true })
  status_code!: number | null;

  /** Request IP */
  @Column({ type: 'varchar', length: 45, nullable: true })
  ip!: string | null;

  /** User ID nếu đã xác thực */
  @Column({ type: 'char', length: 26, nullable: true })
  user_id!: string | null;

  /** User-Agent header */
  @Column({ type: 'varchar', length: 500, nullable: true })
  user_agent!: string | null;

  /** Extra context dạng JSON (request body, params...) */
  @Column({ type: 'json', nullable: true })
  context!: Record<string, unknown> | null;

  @Index()
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = generateUlid();
    }
  }
}
