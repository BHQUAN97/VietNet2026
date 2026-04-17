import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import Redis from 'ioredis';
import { Article, ArticleStatus } from './entities/article.entity';
import { PublishableService } from '../../common/base/base-publishable.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { sanitizeRichText } from '../../common/utils/sanitize-html.util';
import { Cacheable, CacheEvict, InjectRedis } from '../../common/decorators/cacheable.decorator';

@Injectable()
export class ArticlesService extends PublishableService<Article> {
  // ─── Config ──────────────────────────────────────────────────
  protected readonly slugSourceField = 'title' as const;
  protected readonly queryAlias = 'a';
  protected readonly defaultRelations = ['category', 'cover_image'];
  protected readonly detailRelations = ['category', 'cover_image', 'og_image'];
  protected readonly sortAllowlist = {
    display_order: 'a.display_order',
    created_at: 'a.created_at',
    published_at: 'a.published_at',
  };
  // Multi-column default: display_order truoc, created_at sau
  protected readonly defaultSortColumns: [string, 'ASC' | 'DESC'][] = [
    ['display_order', 'ASC'],
    ['created_at', 'DESC'],
  ];
  // Base-level sanitizer chay khi true; ta tat de dung sanitizeRichText rieng ben duoi
  protected readonly sanitizeContent = false;

  constructor(
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,
    @InjectRedis() protected readonly redisClient: Redis,
  ) {
    super(articleRepo, 'Article');
  }

  // ─── Sanitize TipTap HTML content truoc khi luu DB ──────────
  protected async beforeSave(
    data: DeepPartial<Article>,
  ): Promise<DeepPartial<Article>> {
    const enriched = await super.beforeSave(data);
    if ((enriched as any).content !== undefined && (enriched as any).content !== null) {
      (enriched as any).content = sanitizeRichText(
        (enriched as any).content as string,
      );
    }
    return enriched;
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

    // LIKE search tren title va excerpt
    if (search?.trim()) {
      const searchTerm = `%${search.trim()}%`;
      qb.andWhere(
        `(${this.queryAlias}.title LIKE :search OR ${this.queryAlias}.excerpt LIKE :search)`,
        { search: searchTerm },
      );
    }

    return this.executeWithDefaultSort(qb, pagination, filters);
  }

  // ─── Override findPublished: support category slug filter ────

  async findPublished(
    pagination: PaginationDto,
    filters?: Record<string, unknown>,
  ) {
    const qb = this.createBaseQuery(this.queryAlias);

    for (const rel of this.defaultRelations) {
      qb.leftJoinAndSelect(`${this.queryAlias}.${rel}`, rel);
    }

    qb.andWhere(`${this.queryAlias}.status = :status`, {
      status: ArticleStatus.PUBLISHED,
    });

    // Category slug filter
    const categorySlug = filters?.category as string | undefined;
    if (categorySlug) {
      this.applyCategorySlugFilter(qb, categorySlug);
    }

    // is_featured filter
    const isFeatured = filters?.is_featured;
    if (isFeatured !== undefined) {
      qb.andWhere(`${this.queryAlias}.is_featured = :isFeatured`, { isFeatured });
    }

    return this.executeWithDefaultSort(qb, pagination);
  }

  // ─── Cache wrappers ──────────────────────────────────────────

  @Cacheable({
    key: (...args: unknown[]) => `article:slug:${args[0] as string}`,
    ttl: 300,
  })
  async findPublishedBySlug(slug: string): Promise<Article> {
    return super.findPublishedBySlug(slug);
  }

  @CacheEvict({ pattern: 'article:*' })
  async update(id: string, data: DeepPartial<Article>): Promise<Article> {
    return super.update(id, data);
  }

  @CacheEvict({ pattern: 'article:*' })
  async softDelete(id: string): Promise<void> {
    return super.softDelete(id);
  }

  @CacheEvict({ pattern: 'article:*' })
  async publish(id: string): Promise<Article> {
    return super.publish(id);
  }

  // ─── Related articles ────────────────────────────────────────

  async findRelated(articleId: string, limit = 4): Promise<Article[]> {
    const article = await this.findById(articleId);

    const qb = this.createBaseQuery(this.queryAlias)
      .leftJoinAndSelect(`${this.queryAlias}.cover_image`, 'cover_image')
      .andWhere(`${this.queryAlias}.status = :status`, {
        status: ArticleStatus.PUBLISHED,
      })
      .andWhere(`${this.queryAlias}.id != :id`, { id: articleId });

    if (article.category_id) {
      qb.andWhere(`${this.queryAlias}.category_id = :categoryId`, {
        categoryId: article.category_id,
      });
    }

    qb.orderBy(`${this.queryAlias}.published_at`, 'DESC').take(limit);

    return qb.getMany();
  }
}
