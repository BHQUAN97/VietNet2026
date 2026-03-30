import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { generateUlid } from '../../../common/helpers/ulid.helper';

export enum EmailLogStatus {
  QUEUED = 'queued',
  SENT = 'sent',
  FAILED = 'failed',
}

@Entity('email_logs')
export class EmailLog {
  @PrimaryColumn({ type: 'char', length: 26 })
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  type!: string;

  @Column({ type: 'varchar', length: 255 })
  to_email!: string;

  @Column({ type: 'varchar', length: 255 })
  subject!: string;

  @Column({
    type: 'enum',
    enum: EmailLogStatus,
    default: EmailLogStatus.QUEUED,
  })
  status!: EmailLogStatus;

  @Column({ type: 'text', nullable: true })
  error_message!: string | null;

  @Column({ type: 'tinyint', unsigned: true, default: 0 })
  retry_count!: number;

  @Column({ type: 'timestamp', nullable: true })
  sent_at!: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = generateUlid();
    }
  }
}
