import {
  Repository,
  DeepPartial,
  FindOptionsWhere,
  IsNull,
  SelectQueryBuilder,
  ObjectLiteral,
  QueryFailedError,
} from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

// MySQL duplicate entry error code — catch khi DB unique constraint throw
const MYSQL_DUP_ENTRY = 'ER_DUP_ENTRY';
import { PaginationDto } from '../dto/pagination.dto';
import { validateUlid } from '../helpers/ulid.helper';
import { toSlug } from '../helpers/slug.helper';
import {
  applySoftDelete,
  applyFilters,
  applySort,
  applyPagination,
  buildPaginationMeta,
} from '../helpers/query-builder.helper';
import { ActionLogger } from '../helpers/logger.helper';

/**
 * Template Method pattern for CRUD services.
 * Hooks: beforeSave, validate, afterSave, beforeDelete, afterDelete.
 * Built-in: softDelete, publish, slug validation, query builder helpers.
 */
export abstract class BaseService<T extends ObjectLiteral & { id: string }> {
  protected readonly actionLogger: ActionLogger;

  /** Ten entity de dung trong log va error messages (vd: 'Article', 'Product') */
  protected readonly entityName: string;

  constructor(
    protected readonly repository: Repository<T>,
    entityName?: string,
  ) {
    // Lay ten entity tu repository metadata hoac truyen vao
    this.entityName =
      entityName || repository.metadata?.name || 'Entity';
    this.actionLogger = new ActionLogger(`${this.entityName}Service`);
  }

  // ─── Template Method Hooks ────────────────────────────────────

  /** Hook: runs before validation. Override to mutate/enrich data (vd: auto-slug). */
  protected async beforeSave(_data: DeepPartial<T>): Promise<DeepPartial<T>> {
    return _data;
  }

  /** Hook: validate business rules. Throw HttpException on failure. */
  protected async validate(_data: DeepPartial<T>): Promise<void> {
    // Override in subclass
  }

  /** Hook: persist data to DB. Override for custom save logic. */
  protected async saveData(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    try {
      return await this.repository.save(entity);
    } catch (err) {
      // Catch DB-level unique constraint violation (chong TOCTOU race)
      this.handleDbUniqueError(err, data);
      throw err;
    }
  }

  /** Dich MySQL duplicate entry error thanh ConflictException voi message ro rang */
  protected handleDbUniqueError(err: unknown, data?: DeepPartial<T>): void {
    if (err instanceof QueryFailedError) {
      const driverErr = (err as any).driverError;
      if (driverErr?.code === MYSQL_DUP_ENTRY) {
        const slug = (data as any)?.slug;
        const msg = slug
          ? `${this.entityName} voi slug "${slug}" da ton tai`
          : `${this.entityName} da ton tai (duplicate constraint)`;
        throw new ConflictException(msg);
      }
    }
  }

  /** Hook: runs after successful save. Override for side effects. */
  protected async afterSave(_entity: T): Promise<void> {
    // Override in subclass
  }

  protected async beforeDelete(_entity: T): Promise<void> {}
  protected async afterDelete(_entity: T): Promise<void> {}

  // ─── CRUD Operations ──────────────────────────────────────────

  /** Template method: beforeSave -> validate -> saveData -> afterSave */
  async create(data: DeepPartial<T>): Promise<T> {
    const enriched = await this.beforeSave(data);
    await this.validate(enriched);
    const entity = await this.saveData(enriched);
    await this.afterSave(entity);
    return entity;
  }

  /** Basic findAll voi pagination va soft-delete filter */
  async findAll(pagination: PaginationDto) {
    const { page, limit, sort, order } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      where: { deleted_at: IsNull() } as unknown as FindOptionsWhere<T>,
      skip,
      take: limit,
      order: { [sort]: order } as any,
    });

    return { data, meta: buildPaginationMeta(pagination, total) };
  }

  /** Find by ID voi ULID validation + soft-delete filter */
  async findById(id: string): Promise<T> {
    if (!validateUlid(id)) {
      throw new BadRequestException(`Invalid ${this.entityName} ID format`);
    }

    const entity = await this.repository.findOne({
      where: { id, deleted_at: IsNull() } as unknown as FindOptionsWhere<T>,
    });
    if (!entity) {
      throw new NotFoundException(`${this.entityName} with id ${id} not found`);
    }
    return entity;
  }

  /** Update voi hooks */
  async update(id: string, data: DeepPartial<T>): Promise<T> {
    await this.findById(id);
    // Gan id vao data de validateSlugUnique co excludeId
    (data as any).id = id;
    const enriched = await this.beforeSave(data);
    await this.validate(enriched);
    // Xoa id khoi enriched truoc khi update (tranh ghi de PK)
    const { id: _excludedId, ...updateData } = enriched as any;
    try {
      await this.repository.update(id, updateData);
    } catch (err) {
      this.handleDbUniqueError(err, enriched);
      throw err;
    }
    const updated = await this.findById(id);
    await this.afterSave(updated);
    return updated;
  }

  /** Hard delete (it dung — uu tien softDelete) */
  async remove(id: string): Promise<void> {
    const entity = await this.findById(id);
    await this.beforeDelete(entity);
    await this.repository.delete(id);
    await this.afterDelete(entity);
  }

  // ─── Soft Delete ──────────────────────────────────────────────

  /** Soft delete — set deleted_at = now. Override afterDelete cho side effects. */
  async softDelete(id: string): Promise<void> {
    const entity = await this.findById(id);
    await this.beforeDelete(entity);
    await this.repository.update(id, { deleted_at: new Date() } as any);
    await this.afterDelete(entity);
    this.actionLogger.softDelete(this.entityName, id);
  }

  // ─── Publish ──────────────────────────────────────────────────

  /**
   * Publish entity: set status = 'published', published_at = now.
   * Subclass co the override neu can logic khac.
   */
  async publish(id: string): Promise<T> {
    await this.findById(id);
    await this.repository.update(id, {
      status: 'published',
      published_at: new Date(),
    } as any);
    this.actionLogger.publish(this.entityName, id);
    return this.findById(id);
  }

  // ─── Slug Validation ─────────────────────────────────────────

  /**
   * Check slug uniqueness trong cung entity type.
   * Goi trong validate() hook cua subclass.
   * @param slug - Slug can check
   * @param excludeId - ID cua entity dang update (de skip chinh no)
   */
  protected async validateSlugUnique(
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.repository.findOne({
      where: { slug, deleted_at: IsNull() } as unknown as FindOptionsWhere<T>,
    });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(
        `${this.entityName} with slug "${slug}" already exists`,
      );
    }
  }

  /**
   * Auto-generate slug tu title/name.
   * Goi trong beforeSave() hook cua subclass.
   */
  protected generateSlug(
    data: DeepPartial<T>,
    sourceField: 'title' | 'name' = 'title',
  ): DeepPartial<T> {
    const source = (data as any)[sourceField];
    if (source && typeof source === 'string') {
      (data as any).slug = toSlug(source);
    }
    return data;
  }

  // ─── Query Builder Helpers ────────────────────────────────────

  /**
   * Tao QueryBuilder voi soft-delete filter san.
   * Subclass dung de build query phuc tap hon findAll co ban.
   */
  protected createBaseQuery(alias: string): SelectQueryBuilder<T> {
    const qb = this.repository.createQueryBuilder(alias);
    applySoftDelete(qb, alias);
    return qb;
  }

  /**
   * Execute paginated query voi filters va sort.
   * Giam ~20 dong boilerplate moi findAll method.
   */
  protected async executePaginatedQuery(
    qb: SelectQueryBuilder<T>,
    alias: string,
    pagination: PaginationDto,
    options?: {
      filters?: Record<string, unknown>;
      sortAllowlist?: Record<string, string>;
      /** Skip sort — caller da apply sort rieng (vd: multi-column sort) */
      skipSort?: boolean;
    },
  ) {
    if (options?.filters) {
      applyFilters(qb, alias, options.filters);
    }

    if (!options?.skipSort) {
      if (options?.sortAllowlist) {
        applySort(qb, pagination, alias, options.sortAllowlist);
      } else {
        qb.orderBy(`${alias}.created_at`, pagination.order);
      }
    }

    applyPagination(qb, pagination);

    const [data, total] = await qb.getManyAndCount();
    return { data, meta: buildPaginationMeta(pagination, total) };
  }

  // ─── ULID Validation Helpers ──────────────────────────────────

  /** Validate ULID cua foreign key fields. Throw BadRequest neu invalid. */
  protected validateForeignKeys(
    data: Record<string, unknown>,
    fields: string[],
  ): void {
    for (const field of fields) {
      const value = data[field];
      if (value && typeof value === 'string' && !validateUlid(value)) {
        throw new BadRequestException(`Invalid ${field} format`);
      }
    }
  }

  // ─── View Count ───────────────────────────────────────────────

  /** Increment view count — fire-and-forget, khong throw. */
  async incrementViewCount(id: string): Promise<void> {
    if (!validateUlid(id)) return;
    await this.repository.increment({ id } as any, 'view_count' as any, 1);
  }
}
