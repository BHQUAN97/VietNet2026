import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, IsNull } from 'typeorm';
import { Product, ProductStatus } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { BaseService } from '../../common/base/base.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { toSlug } from '../../common/helpers/slug.helper';
import { validateUlid } from '../../common/helpers/ulid.helper';

interface ProductFilters {
  category_id?: string;
  material_type?: string;
  finish?: string;
  status?: ProductStatus;
}

@Injectable()
export class ProductsService extends BaseService<Product> {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,
  ) {
    super(productsRepository);
  }

  /**
   * Create a product and handle image associations if provided.
   */
  async createWithImages(data: DeepPartial<Product> & { image_ids?: string[] }): Promise<Product> {
    const { image_ids, ...productData } = data as any;
    const product = await this.create(productData);

    if (image_ids && image_ids.length > 0) {
      await this.updateImages(product.id, image_ids);
    }

    return product;
  }

  /**
   * Hook: auto-generate slug from name before saving.
   */
  protected async beforeSave(
    data: DeepPartial<Product>,
  ): Promise<DeepPartial<Product>> {
    if (data.name && typeof data.name === 'string') {
      data.slug = toSlug(data.name);
    }
    return data;
  }

  /**
   * Hook: check slug uniqueness.
   */
  protected async validate(data: DeepPartial<Product>): Promise<void> {
    if (!data.slug) return;

    const existing = await this.productsRepository.findOne({
      where: { slug: data.slug as string, deleted_at: IsNull() },
    });

    // Allow update of the same entity
    if (existing && existing.id !== (data as any).id) {
      throw new ConflictException(
        `Product with slug "${data.slug}" already exists`,
      );
    }
  }

  /**
   * Override findById to validate ULID and exclude soft-deleted records.
   */
  async findById(id: string): Promise<Product> {
    if (!validateUlid(id)) {
      throw new BadRequestException('Invalid product ID format');
    }

    const product = await this.productsRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['category', 'cover_image'],
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  /**
   * Admin list: all statuses, excludes soft-deleted.
   */
  async findAll(pagination: PaginationDto, filters?: ProductFilters) {
    const { page, limit, sort, order } = pagination;
    const skip = (page - 1) * limit;

    const qb = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.cover_image', 'cover_image')
      .where('product.deleted_at IS NULL');

    if (filters?.category_id) {
      qb.andWhere('product.category_id = :categoryId', {
        categoryId: filters.category_id,
      });
    }

    if (filters?.material_type) {
      qb.andWhere('product.material_type = :materialType', {
        materialType: filters.material_type,
      });
    }

    if (filters?.finish) {
      qb.andWhere('product.finish = :finish', { finish: filters.finish });
    }

    if (filters?.status) {
      qb.andWhere('product.status = :status', { status: filters.status });
    }

    qb.orderBy(`product.${sort}`, order).skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Public list: only published, non-deleted products.
   */
  async findPublished(pagination: PaginationDto, filters?: ProductFilters) {
    const { page, limit, sort, order } = pagination;
    const skip = (page - 1) * limit;

    const qb = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.cover_image', 'cover_image')
      .where('product.deleted_at IS NULL')
      .andWhere('product.status = :status', {
        status: ProductStatus.PUBLISHED,
      });

    if (filters?.category_id) {
      qb.andWhere('product.category_id = :categoryId', {
        categoryId: filters.category_id,
      });
    }

    if (filters?.material_type) {
      qb.andWhere('product.material_type = :materialType', {
        materialType: filters.material_type,
      });
    }

    if (filters?.finish) {
      qb.andWhere('product.finish = :finish', { finish: filters.finish });
    }

    qb.orderBy(`product.${sort}`, order).skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Find a product by its slug, with all relations loaded.
   */
  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.cover_image', 'cover_image')
      .leftJoinAndSelect('product.og_image', 'og_image')
      .where('product.slug = :slug', { slug })
      .andWhere('product.deleted_at IS NULL')
      .getOne();

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }

    return product;
  }

  /**
   * Manage product_images pivot entries.
   * Replaces all existing image associations with the provided media IDs.
   */
  async updateImages(productId: string, mediaIds: string[]): Promise<void> {
    if (!validateUlid(productId)) {
      throw new NotFoundException('Invalid product ID');
    }

    // Verify product exists
    await this.findById(productId);

    // Remove existing images
    await this.productImagesRepository.delete({ product_id: productId });

    // Insert new images
    if (mediaIds.length > 0) {
      const images = mediaIds.map((mediaId, index) =>
        this.productImagesRepository.create({
          product_id: productId,
          media_id: mediaId,
          display_order: index,
          is_primary: index === 0,
        }),
      );
      await this.productImagesRepository.save(images);
    }

    this.logger.log(
      `Updated images for product ${productId}: ${mediaIds.length} images`,
    );
  }

  /**
   * Soft delete a product by setting deleted_at.
   */
  async softDelete(id: string): Promise<void> {
    if (!validateUlid(id)) {
      throw new NotFoundException('Invalid product ID');
    }

    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    await this.productsRepository.update(id, { deleted_at: new Date() });
    this.logger.log(`Soft deleted product ${id}`);
  }

  /**
   * Publish a product: set status to published and record timestamp.
   */
  async publish(id: string): Promise<Product> {
    if (!validateUlid(id)) {
      throw new NotFoundException('Invalid product ID');
    }

    await this.findById(id);

    await this.productsRepository.update(id, {
      status: ProductStatus.PUBLISHED,
      published_at: new Date(),
    });

    const updated = await this.findById(id);
    this.logger.log(`Published product ${id}`);
    return updated;
  }

  /**
   * Get product images for a given product.
   */
  async getImages(productId: string): Promise<ProductImage[]> {
    return this.productImagesRepository.find({
      where: { product_id: productId },
      relations: ['media'],
      order: { display_order: 'ASC' },
    });
  }
}
