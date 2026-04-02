import { IsOptional, IsString } from 'class-validator';
import { PublishableFilterDto } from '../../../common/dto/base-filter.dto';

/**
 * Query DTO cho GET /products (public + admin).
 * Ke thua PublishableFilterDto: status, search, category_id, is_featured, page, limit, sort, order.
 * Chi them cac field rieng cua Product: material_type, finish.
 */
export class QueryProductDto extends PublishableFilterDto {
  @IsOptional()
  @IsString()
  material_type?: string;

  @IsOptional()
  @IsString()
  finish?: string;
}

/** Query DTO cho GET /products/admin/list — dung chung QueryProductDto */
export class QueryProductAdminDto extends QueryProductDto {}
