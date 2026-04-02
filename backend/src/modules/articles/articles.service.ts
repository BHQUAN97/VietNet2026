import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article, ArticleStatus } from './entities/article.entity';
import { PublishableService } from '../../common/base/base-publishable.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

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

  constructor(
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,
  ) {
    super(articleRepo, 'Article');
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
