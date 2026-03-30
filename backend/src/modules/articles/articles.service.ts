import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DeepPartial } from 'typeorm';
import { Article, ArticleStatus } from './entities/article.entity';
import { BaseService } from '../../common/base/base.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { validateUlid } from '../../common/helpers/ulid.helper';
import { toSlug } from '../../common/helpers/slug.helper';
import { sanitizeHtml } from '../../common/helpers/sanitize.helper';

@Injectable()
export class ArticlesService extends BaseService<Article> {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,
  ) {
    super(articleRepo);
  }

  protected async beforeSave(
    data: DeepPartial<Article>,
  ): Promise<DeepPartial<Article>> {
    if (data.title) {
      data.slug = toSlug(data.title as string);
    }

    // Sanitize HTML content before saving
    if (data.content) {
      data.content = sanitizeHtml(data.content as string);
    }

    if (data.category_id && !validateUlid(data.category_id as string)) {
      throw new BadRequestException('Invalid category_id format');
    }

    if (data.cover_image_id && !validateUlid(data.cover_image_id as string)) {
      throw new BadRequestException('Invalid cover_image_id format');
    }

    if (data.og_image_id && !validateUlid(data.og_image_id as string)) {
      throw new BadRequestException('Invalid og_image_id format');
    }

    return data;
  }

  protected async validate(data: DeepPartial<Article>): Promise<void> {
    if (data.slug) {
      const existing = await this.articleRepo.findOne({
        where: {
          slug: data.slug as string,
          deleted_at: IsNull(),
        },
      });
      if (existing && existing.id !== (data as any).id) {
        throw new ConflictException(
          `Article slug "${data.slug}" already exists`,
        );
      }
    }
  }

  async findAll(
    pagination: PaginationDto,
    filters?: {
      category_id?: string;
      status?: ArticleStatus;
      is_featured?: boolean;
    },
  ) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const qb = this.articleRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.category', 'category')
      .leftJoinAndSelect('a.cover_image', 'cover_image')
      .where('a.deleted_at IS NULL');

    if (filters?.category_id) {
      qb.andWhere('a.category_id = :categoryId', {
        categoryId: filters.category_id,
      });
    }

    if (filters?.status) {
      qb.andWhere('a.status = :status', { status: filters.status });
    }

    if (filters?.is_featured !== undefined) {
      qb.andWhere('a.is_featured = :isFeatured', {
        isFeatured: filters.is_featured,
      });
    }

    qb.orderBy('a.display_order', 'ASC')
      .addOrderBy('a.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findBySlug(slug: string): Promise<Article> {
    const article = await this.articleRepo.findOne({
      where: { slug, deleted_at: IsNull() },
      relations: ['category', 'cover_image', 'og_image'],
    });

    if (!article) {
      throw new NotFoundException(`Article with slug "${slug}" not found`);
    }

    return article;
  }

  async findPublished(pagination: PaginationDto, categorySlug?: string) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const qb = this.articleRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.category', 'category')
      .leftJoinAndSelect('a.cover_image', 'cover_image')
      .where('a.deleted_at IS NULL')
      .andWhere('a.status = :status', { status: ArticleStatus.PUBLISHED });

    if (categorySlug) {
      qb.andWhere('category.slug = :categorySlug', { categorySlug });
      qb.andWhere('category.deleted_at IS NULL');
    }

    qb.orderBy('a.display_order', 'ASC')
      .addOrderBy('a.published_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findRelated(articleId: string, limit = 4): Promise<Article[]> {
    const article = await this.findById(articleId);

    const qb = this.articleRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.cover_image', 'cover_image')
      .where('a.deleted_at IS NULL')
      .andWhere('a.status = :status', { status: ArticleStatus.PUBLISHED })
      .andWhere('a.id != :id', { id: articleId });

    if (article.category_id) {
      qb.andWhere('a.category_id = :categoryId', {
        categoryId: article.category_id,
      });
    }

    qb.orderBy('a.published_at', 'DESC').take(limit);

    return qb.getMany();
  }

  async findById(id: string): Promise<Article> {
    if (!validateUlid(id)) {
      throw new BadRequestException('Invalid article ID format');
    }

    const article = await this.articleRepo.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['category', 'cover_image'],
    });

    if (!article) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }

    return article;
  }

  async softDelete(id: string): Promise<void> {
    if (!validateUlid(id)) {
      throw new BadRequestException('Invalid article ID format');
    }

    const article = await this.findById(id);
    await this.articleRepo.update(article.id, { deleted_at: new Date() });
    this.logger.log(`Article ${id} soft-deleted`);
  }

  async publish(id: string): Promise<Article> {
    if (!validateUlid(id)) {
      throw new BadRequestException('Invalid article ID format');
    }

    const article = await this.findById(id);
    await this.articleRepo.update(article.id, {
      status: ArticleStatus.PUBLISHED,
      published_at: new Date(),
    });

    this.logger.log(`Article ${id} published`);
    return this.findById(id);
  }

  async incrementViewCount(id: string): Promise<void> {
    if (!validateUlid(id)) {
      throw new BadRequestException('Invalid article ID format');
    }

    await this.articleRepo.increment({ id }, 'view_count', 1);
  }
}
