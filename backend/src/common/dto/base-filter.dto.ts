import { IsOptional, IsString, IsEnum, IsBooleanString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from './pagination.dto';

/**
 * Base filter DTO — gom status + search chung cho tat ca admin list endpoints.
 * Cac module-specific DTO extends class nay de them filter rieng.
 */
export class BaseFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

/**
 * Filter DTO cho publishable entities (Products, Articles, Projects).
 * Gom cac field chung: category_id, is_featured, + status/search tu BaseFilterDto.
 */
export class PublishableFilterDto extends BaseFilterDto {
  @IsOptional()
  @IsString()
  category_id?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  is_featured?: boolean;
}
