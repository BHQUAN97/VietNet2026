import { IsOptional, IsEnum } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CategoryType } from '../entities/category.entity';

/** Query DTO cho GET /categories */
export class QueryCategoryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;
}
