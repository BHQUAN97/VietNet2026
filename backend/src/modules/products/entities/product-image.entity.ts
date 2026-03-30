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
import { Product } from './product.entity';
import { Media } from '../../media/entities/media.entity';

@Entity('product_images')
export class ProductImage {
  @PrimaryColumn({ type: 'char', length: 26 })
  id!: string;

  @Column({ type: 'char', length: 26 })
  product_id!: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ type: 'char', length: 26 })
  media_id!: string;

  @ManyToOne(() => Media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'media_id' })
  media!: Media;

  @Column({ type: 'int', default: 0 })
  display_order!: number;

  @Column({ type: 'tinyint', width: 1, default: false })
  is_primary!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  caption!: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = generateUlid();
    }
  }
}
