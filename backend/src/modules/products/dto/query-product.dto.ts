import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ProductStatus } from '../entities/product.entity';

/** Query DTO cho GET /products (public) */
export class QueryProductDto extends PaginationDto {
  @IsOptional()
  @IsString()
  category_id?: string;

  @IsOptional()
  @IsString()
  material_type?: string;

  @IsOptional()
  @IsString()
  finish?: string;
}

/** Query DTO cho GET /products/admin/list */
export class QueryProductAdminDto extends QueryProductDto {
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
