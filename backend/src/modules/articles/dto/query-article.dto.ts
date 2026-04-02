import { IsOptional, IsString } from 'class-validator';
import { PublishableFilterDto } from '../../../common/dto/base-filter.dto';

/**
 * Query DTO cho GET /articles (public).
 * Ke thua PublishableFilterDto: status, search, category_id, is_featured, page, limit, sort, order.
 * Them category (slug) cho public filter.
 */
export class QueryArticleDto extends PublishableFilterDto {
  /** Category slug cho public filter */
  @IsOptional()
  @IsString()
  category?: string;
}

/** Query DTO cho GET /articles/admin/list */
export class QueryArticleAdminDto extends PublishableFilterDto {}
