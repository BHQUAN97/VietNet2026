import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  Unique,
} from 'typeorm';
import { generateUlid } from '../../../common/helpers/ulid.helper';

export enum CategoryType {
  PROJECT = 'project',
  PRODUCT = 'product',
}

@Entity('categories')
@Unique(['slug', 'type'])
export class Category {
  @PrimaryColumn({ type: 'char', length: 26 })
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 100 })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'enum', enum: CategoryType })
  type!: CategoryType;

  @Column({ type: 'char', length: 26, nullable: true })
  parent_id!: string | null;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'parent_id' })
  parent!: Category | null;

  @Column({ type: 'int', default: 0 })
  display_order!: number;

  @Column({ type: 'tinyint', width: 1, default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at!: Date | null;

  @Column({ type: 'char', length: 26, nullable: true })
  created_by!: string | null;

  @Column({ type: 'char', length: 26, nullable: true })
  updated_by!: string | null;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = generateUlid();
    }
  }
}
