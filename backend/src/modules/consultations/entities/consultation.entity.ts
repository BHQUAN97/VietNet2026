import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  Index,
} from 'typeorm';
import { generateUlid } from '../../../common/helpers/ulid.helper';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

export enum ConsultationProjectType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  HOSPITALITY = 'hospitality',
  RENOVATION = 'renovation',
  OTHER = 'other',
}

export enum ConsultationStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Indexes for admin list (filter by status + sort by created_at)
@Index('IDX_consultations_created_at', ['created_at'])
@Index('IDX_consultations_status_created_at', ['status', 'created_at'])
@Entity('consultations')
export class Consultation {
  @PrimaryColumn({ type: 'char', length: 26 })
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  @Column({
    type: 'enum',
    enum: ConsultationProjectType,
    nullable: true,
  })
  project_type!: ConsultationProjectType | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  area!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  budget_range!: string | null;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'char', length: 26, nullable: true })
  product_id!: string | null;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Product | null;

  @Column({
    type: 'enum',
    enum: ConsultationStatus,
    default: ConsultationStatus.NEW,
  })
  status!: ConsultationStatus;

  @Column({ type: 'char', length: 26, nullable: true })
  assigned_to!: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_to' })
  assignee!: User | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  status_changed_at!: Date | null;

  @Column({ type: 'char', length: 26, nullable: true })
  status_changed_by!: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address!: string | null;

  @Column({ type: 'text', nullable: true })
  user_agent!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  source!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  honeypot!: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at!: Date | null;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = generateUlid();
    }
  }
}
