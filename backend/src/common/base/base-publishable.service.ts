import {
  Repository,
  DeepPartial,
  IsNull,
  ObjectLiteral,
} from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BaseService } from './base.service';
import { PaginationDto } from '../dto/pagination.dto';
import { sanitizeHtml } from '../helpers/sanitize.helper';
import { validateUlid } from '../helpers/ulid.helper';

/**
 * PublishableService — base cho entities co slug, status, SEO, category.
 * Gom ~70% logic lap giua Products, Articles, Projects.
 *
 * Subclass chi can:
 * 1. Define abstract config (slugSourceField, relations, sortAllowlist)
 * 2. Override nhung method RIENG (vd: updateImages, findRelated)
 *
 * Co san: beforeSave (slug + sanitize + FK validate), validate (slug unique),
 * findAll, findPublished, findBySlug, findById voi relations.
 */
export abstract class PublishableService<
  T extends ObjectLiteral & { id: string },
> extends BaseService<T> {
  // ─── Abstract Config — subclass PHAI define ──────────────────

  /** Field dung de generate slug: 'name' (Products) hoac 'title' (Articles, Projects) */
  protected abstract readonly slugSourceField: 'name' | 'title';

  /** Relations load khi list (findAll, findPublished) — vd: ['category', 'cover_image'] */
  protected abstract readonly defaultRelations: string[];

  /** Relations load khi detail (findBySlug, findById) — vd: ['category', 'cover_image', 'og_image'] */
  protected abstract readonly detailRelations: string[];

  /** Sort allowlist — vd: { display_order: 'p.display_order', created_at: 'p.created_at' } */
  protected abstract readonly sortAllowlist: Record<string, string>;

  /** Query alias — vd: 'product', 'a', 'p' */
  protected abstract readonly queryAlias: string;

  /** FK fields can validate ULID (default: category_id, cover_image_id, og_image_id) */
  protected readonly foreignKeyFields: string[] = [
    'category_id',
    'cover_image_id',
    'og_image_id',
  ];

  /** Co sanitize HTML content khong (default: true — Articles, Projects co content field) */
  protected readonly sanitizeContent: boolean = true;

  /** Status field value cho published (default: 'published') */
  protected readonly publishedStatus: string = 'published';

  /**
   * Default sort khi client khong chi dinh sort param.
   * Mang cac cap [column, direction] — apply theo thu tu.
   * Vd: [['display_order', 'ASC'], ['created_at', 'DESC']]
   * Default: [['created_at', 'DESC']]
   */
  protected readonly defaultSortColumns: [string, 'ASC' | 'DESC'][] = [
    ['created_at', 'DESC'],
  ];

  // ─── Template Method Hooks (da implement chung) ──────────────

  protected async beforeSave(
    data: DeepPartial<T>,
  ): Promise<DeepPartial<T>> {
    // Auto-generate slug
    this.generateSlug(data, this.slugSourceField);

    // Sanitize HTML content
    if (this.sanitizeContent && (data as any).content) {
      (data as any).content = sanitizeHtml((data as any).content as string);
    }

    // Validate FK ULIDs
    this.validateForeignKeys(data as any, this.foreignKeyFields);

    return data;
  }

  protected async validate(data: DeepPartial<T>): Promise<void> {
    if ((data as any).slug) {
      await this.validateSlugUnique(
        (data as any).slug as string,
        (data as any).id,
      );
    }
  }

  // ─── findById voi relations (single query) ────────────────────

  async findById(id: string): Promise<T> {
    if (!validateUlid(id)) {
      throw new BadRequestException(`Invalid ${this.entityName} ID format`);
    }

    const entity = await this.repository.findOne({
      where: { id, deleted_at: IsNull() } as any,
      relations: this.defaultRelations,
    });

    if (!entity) {
      throw new NotFoundException(`${this.entityName} with id ${id} not found`);
    }

    return entity;
  }

  // ─── findAll (admin list) ────────────────────────────────────

  async findAll(
    pagination: PaginationDto,
    filters?: Record<string, unknown>,
  ) {
    const qb = this.createBaseQuery(this.queryAlias);

    for (const rel of this.defaultRelations) {
      qb.leftJoinAndSelect(`${this.queryAlias}.${rel}`, rel);
    }

    return this.executeWithDefaultSort(qb, pagination, filters);
  }

  // ─── findPublished (public list) ─────────────────────────────

  async findPublished(
    pagination: PaginationDto,
    filters?: Record<string, unknown>,
  ) {
    const qb = this.createBaseQuery(this.queryAlias);

    for (const rel of this.defaultRelations) {
      qb.leftJoinAndSelect(`${this.queryAlias}.${rel}`, rel);
    }

    qb.andWhere(`${this.queryAlias}.status = :status`, {
      status: this.publishedStatus,
    });

    return this.executeWithDefaultSort(qb, pagination, filters);
  }

  // ─── Helper: execute query voi multi-column default sort ─────

  /**
   * Execute paginated query voi multi-column sort support.
   * Khi client chi dinh sort param khac default -> dung allowlist (single column).
   * Khi client dung default sort -> apply defaultSortColumns (multi-column).
   */
  protected async executeWithDefaultSort(
    qb: ReturnType<typeof this.createBaseQuery>,
    pagination: PaginationDto,
    filters?: Record<string, unknown>,
  ) {
    const isDefaultSort = pagination.sort === 'created_at';

    if (isDefaultSort && this.defaultSortColumns.length > 0) {
      // Apply multi-column sort manually
      const [first, ...rest] = this.defaultSortColumns;
      const col = this.sortAllowlist[first[0]] || `${this.queryAlias}.${first[0]}`;
      qb.orderBy(col, first[1]);
      for (const [field, dir] of rest) {
        const sortCol = this.sortAllowlist[field] || `${this.queryAlias}.${field}`;
        qb.addOrderBy(sortCol, dir);
      }

      return this.executePaginatedQuery(qb, this.queryAlias, pagination, {
        filters,
        skipSort: true,
      });
    }

    // Client specified custom sort -> single-column via allowlist
    return this.executePaginatedQuery(qb, this.queryAlias, pagination, {
      filters,
      sortAllowlist: this.sortAllowlist,
    });
  }

  // ─── findBySlug ───────────────────────────────────────────────

  /**
   * Find by slug — dung cho admin (khong check status).
   * Public endpoints nen dung findPublishedBySlug().
   */
  async findBySlug(slug: string): Promise<T> {
    const entity = await this.repository.findOne({
      where: { slug, deleted_at: IsNull() } as any,
      relations: this.detailRelations,
    });

    if (!entity) {
      throw new NotFoundException(
        `${this.entityName} with slug "${slug}" not found`,
      );
    }

    return entity;
  }

  /**
   * Find published entity by slug — CHI tra ve status = published.
   * Dung cho public-facing endpoints de tranh leak draft content.
   */
  async findPublishedBySlug(slug: string): Promise<T> {
    const entity = await this.repository.findOne({
      where: {
        slug,
        status: this.publishedStatus,
        deleted_at: IsNull(),
      } as any,
      relations: this.detailRelations,
    });

    if (!entity) {
      throw new NotFoundException(
        `${this.entityName} with slug "${slug}" not found`,
      );
    }

    return entity;
  }

  // ─── findPublishedByCategorySlug (optional helper) ───────────

  /**
   * Filter by category slug cho public endpoints.
   * Subclass goi trong findPublished override neu can.
   */
  protected applyCategorySlugFilter(
    qb: ReturnType<typeof this.createBaseQuery>,
    categorySlug: string,
  ): void {
    qb.andWhere('category.slug = :categorySlug', { categorySlug });
    qb.andWhere('category.deleted_at IS NULL');
  }
}
