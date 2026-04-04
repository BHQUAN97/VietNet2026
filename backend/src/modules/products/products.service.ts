import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { PublishableService } from '../../common/base/base-publishable.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { MediaAssociation } from '../../common/services/base-media-association.service';

@Injectable()
export class ProductsService extends PublishableService<Product> {
  // ─── Config ──────────────────────────────────────────────────
  protected readonly slugSourceField = 'name' as const;
  protected readonly queryAlias = 'product';
  protected readonly defaultRelations = ['category', 'cover_image'];
  protected readonly detailRelations = ['category', 'cover_image', 'og_image'];
  protected readonly sortAllowlist = {
    name: 'product.name',
    created_at: 'product.created_at',
    updated_at: 'product.updated_at',
    price: 'product.price',
    status: 'product.status',
    published_at: 'product.published_at',
    display_order: 'product.display_order',
  };
  // Products khong co HTML content field
  protected readonly sanitizeContent = false;

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,
  ) {
    super(productsRepository, 'Product');
  }

  // ─── Admin list voi LIKE search ──────────────────────────────

  async findAllAdmin(
    pagination: PaginationDto,
    filters?: Record<string, unknown>,
    search?: string,
  ) {
    const qb = this.createBaseQuery(this.queryAlias);

    for (const rel of this.defaultRelations) {
      qb.leftJoinAndSelect(`${this.queryAlias}.${rel}`, rel);
    }

    // LIKE search tren name va description
    if (search?.trim()) {
      const searchTerm = `%${search.trim()}%`;
      qb.andWhere(
        `(${this.queryAlias}.name LIKE :search OR ${this.queryAlias}.description LIKE :search)`,
        { search: searchTerm },
      );
    }

    return this.executeWithDefaultSort(qb, pagination, filters);
  }

  // ─── Create voi images ───────────────────────────────────────

  async createWithImages(data: DeepPartial<Product> & { image_ids?: string[] }): Promise<Product> {
    const { image_ids, ...productData } = data as any;
    const product = await this.create(productData);

    if (image_ids && image_ids.length > 0) {
      await this.updateImages(product.id, image_ids);
    }

    return product;
  }

  // ─── Image management (dung MediaAssociation helper) ──────────

  async updateImages(productId: string, mediaIds: string[]): Promise<void> {
    await this.findById(productId);
    await MediaAssociation.sync(this.productImagesRepository, {
      entityIdField: 'product_id',
      entityId: productId,
      mediaIds,
    }, { withPrimary: true });
  }

  async getImages(productId: string): Promise<ProductImage[]> {
    return MediaAssociation.getMedia(this.productImagesRepository, {
      entityIdField: 'product_id',
      entityId: productId,
    });
  }
}
