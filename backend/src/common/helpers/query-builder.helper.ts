import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { PaginationDto } from '../dto/pagination.dto';
import { resolveSortColumn } from './sort-validator';

/**
 * Helper giam lap code QueryBuilder across services.
 * Moi service chi can goi cac ham nay thay vi copy-paste.
 */

/** Apply soft-delete filter: WHERE alias.deleted_at IS NULL */
export function applySoftDelete<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  alias: string,
): SelectQueryBuilder<T> {
  return qb.where(`${alias}.deleted_at IS NULL`);
}

/** Apply pagination: skip + take */
export function applyPagination<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  pagination: PaginationDto,
): SelectQueryBuilder<T> {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;
  return qb.skip(skip).take(limit);
}

/** Apply sort voi allowlist validation */
export function applySort<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  pagination: PaginationDto,
  alias: string,
  allowlist: Record<string, string>,
): SelectQueryBuilder<T> {
  const safeSort = resolveSortColumn(pagination.sort, alias, allowlist);
  return qb.orderBy(safeSort, pagination.order);
}

/**
 * Regex validate column name — chi cho phep alphanumeric + underscore.
 * Chong SQL injection qua column name interpolation.
 */
const SAFE_COLUMN_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Apply filters tu object — chi add andWhere cho cac key co gia tri.
 * Column name duoc validate bang regex truoc khi interpolate vao SQL.
 *
 * filters: { category_id: '123', status: 'published' }
 * => andWhere('alias.category_id = :category_id', { category_id: '123' })
 *    andWhere('alias.status = :status', { status: 'published' })
 */
export function applyFilters<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  alias: string,
  filters: Record<string, unknown>,
): SelectQueryBuilder<T> {
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      // Validate column name — chong SQL injection qua key
      if (!SAFE_COLUMN_RE.test(key)) {
        continue; // Bo qua key khong hop le — khong throw de tranh info leak
      }
      qb.andWhere(`${alias}.${key} = :filter_${key}`, { [`filter_${key}`]: value });
    }
  }
  return qb;
}

/** Build pagination meta tu total count */
export function buildPaginationMeta(
  pagination: PaginationDto,
  total: number,
) {
  return {
    page: pagination.page,
    limit: pagination.limit,
    total,
    totalPages: Math.ceil(total / pagination.limit),
  };
}

/**
 * Full pipeline: softDelete + filters + sort + pagination + execute.
 * Tra ve { data, meta } — pattern chuan cho findAll.
 */
export async function executePaginatedQuery<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  alias: string,
  pagination: PaginationDto,
  options?: {
    filters?: Record<string, unknown>;
    sortAllowlist?: Record<string, string>;
    /** Skip sort — caller da apply sort rieng (vd: multi-column sort) */
    skipSort?: boolean;
  },
): Promise<{ data: T[]; meta: ReturnType<typeof buildPaginationMeta> }> {
  applySoftDelete(qb, alias);

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
