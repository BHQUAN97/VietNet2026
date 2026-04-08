import { IsOptional, IsInt, Min, Max, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

/** Allowed sort columns to prevent SQL injection in ORDER BY */
const ALLOWED_SORT_COLUMNS = [
  'created_at',
  'updated_at',
  'name',
  'title',
  'status',
  'display_order',
  'published_at',
  'view_count',
  'email',
  'full_name',
] as const;

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit: number = 20;

  @IsOptional()
  @IsString()
  @IsIn(ALLOWED_SORT_COLUMNS)
  sort: string = 'created_at';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order: 'ASC' | 'DESC' = 'DESC';
}
