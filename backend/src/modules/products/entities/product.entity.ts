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
import { Category } from '../../projects/entities/category.entity';
import { Media } from '../../media/entities/media.entity';

export enum ProductStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity('products')
export class Product {
  @PrimaryColumn({ type: 'char', length: 26 })
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'char', length: 26, nullable: true })
  category_id!: string | null;

  @ManyToOne(() => Category, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category!: Category | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  material_type!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  finish!: string | null;

  @Column({ type: 'json', nullable: true })
  dimensions!: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  price_range!: string | null;

  @Column({ type: 'char', length: 26, nullable: true })
  cover_image_id!: string | null;

  @ManyToOne(() => Media, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cover_image_id' })
  cover_image!: Media | null;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status!: ProductStatus;

  @Column({ type: 'timestamp', nullable: true })
  published_at!: Date | null;

  @Column({ type: 'tinyint', width: 1, default: false })
  is_new!: boolean;

  @Column({ type: 'tinyint', width: 1, default: false })
  is_featured!: boolean;

  @Column({ type: 'int', default: 0 })
  display_order!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  seo_title!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  seo_description!: string | null;

  @Column({ type: 'char', length: 26, nullable: true })
  og_image_id!: string | null;

  @ManyToOne(() => Media, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'og_image_id' })
  og_image!: Media | null;

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
