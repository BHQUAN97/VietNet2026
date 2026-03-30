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
import { User } from '../../users/entities/user.entity';

export enum MediaProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('media')
export class Media {
  @PrimaryColumn({ type: 'char', length: 26 })
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  original_filename!: string;

  @Column({ type: 'varchar', length: 50 })
  mime_type!: string;

  @Column({ type: 'int', unsigned: true })
  file_size!: number;

  @Column({ type: 'varchar', length: 500 })
  original_url!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnail_url!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  preview_url!: string | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  width!: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  height!: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  alt_text!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  blurhash!: string | null;

  @Column({
    type: 'enum',
    enum: MediaProcessingStatus,
    default: MediaProcessingStatus.PENDING,
  })
  processing_status!: MediaProcessingStatus;

  @Column({ type: 'text', nullable: true })
  processing_error!: string | null;

  @Column({ type: 'char', length: 26 })
  uploaded_by!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'uploaded_by' })
  uploader!: User;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at!: Date | null;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = generateUlid();
    }
  }
}
