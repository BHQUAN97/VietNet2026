/**
 * Barrel export cho common module.
 * Import: import { ParseUlidPipe, AdminOnly, ... } from '../../common';
 */

// Pipes
export { ParseUlidPipe } from './pipes/parse-ulid.pipe';

// Decorators
export { AdminOnly, EditorOnly } from './decorators/admin-only.decorator';
export { Public } from './decorators/public.decorator';
export { Roles } from './decorators/roles.decorator';
export { CurrentUser } from './decorators/current-user.decorator';
export { Cacheable, CacheEvict, InjectRedis, REDIS_CLIENT } from './decorators/cacheable.decorator';

// Guards
export { JwtAuthGuard } from './guards/jwt-auth.guard';
export { RolesGuard } from './guards/roles.guard';

// Helpers
export { generateUlid, validateUlid } from './helpers/ulid.helper';
export { toSlug } from './helpers/slug.helper';
export { sanitizeHtml } from './helpers/sanitize.helper';
export { ok, fail, paginated } from './helpers/response.helper';
export { ActionLogger } from './helpers/logger.helper';
export { resolveSortColumn, buildSortAllowlist } from './helpers/sort-validator';
export { validateUploadedFile, sanitizeFilename, getExtension } from './helpers/file-validator';
export {
  applySoftDelete,
  applyPagination,
  applySort,
  applyFilters,
  buildPaginationMeta,
  executePaginatedQuery,
} from './helpers/query-builder.helper';

// Base
export { BaseService } from './base/base.service';

// DTOs
export { PaginationDto } from './dto/pagination.dto';

// Modules
export { RedisModule } from './modules/redis.module';
