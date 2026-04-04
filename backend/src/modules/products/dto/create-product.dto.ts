import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsArray,
  IsObject,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '../entities/product.entity';

export class CreateProductDto {
  @IsString({ message: 'Tên sản phẩm không hợp lệ' })
  @MinLength(2, { message: 'Tên sản phẩm cần ít nhất 2 ký tự' })
  @MaxLength(255, { message: 'Tên sản phẩm tối đa 255 ký tự' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'Mô tả không hợp lệ' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Mã danh mục không hợp lệ' })
  @MaxLength(26, { message: 'Mã danh mục tối đa 26 ký tự' })
  category_id?: string;

  @IsOptional()
  @IsString({ message: 'Loại vật liệu không hợp lệ' })
  @MaxLength(100, { message: 'Loại vật liệu tối đa 100 ký tự' })
  material_type?: string;

  @IsOptional()
  @IsString({ message: 'Bề mặt hoàn thiện không hợp lệ' })
  @MaxLength(100, { message: 'Bề mặt hoàn thiện tối đa 100 ký tự' })
  finish?: string;

  @IsOptional()
  @IsObject({ message: 'Kích thước phải là object' })
  dimensions?: Record<string, unknown>;

  @IsOptional()
  @IsString({ message: 'Khoảng giá không hợp lệ' })
  @MaxLength(100, { message: 'Khoảng giá tối đa 100 ký tự' })
  price_range?: string;

  @IsOptional()
  @IsString({ message: 'Mã ảnh bìa không hợp lệ' })
  @MaxLength(26, { message: 'Mã ảnh bìa tối đa 26 ký tự' })
  cover_image_id?: string;

  @IsOptional()
  @IsEnum(ProductStatus, { message: 'Trạng thái sản phẩm không hợp lệ' })
  status?: ProductStatus;

  @IsOptional()
  @IsBoolean({ message: 'Giá trị sản phẩm mới phải là true hoặc false' })
  @Type(() => Boolean)
  is_new?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Giá trị nổi bật phải là true hoặc false' })
  @Type(() => Boolean)
  is_featured?: boolean;

  @IsOptional()
  @IsInt({ message: 'Thứ tự hiển thị phải là số nguyên' })
  @Min(0, { message: 'Thứ tự hiển thị không được âm' })
  @Type(() => Number)
  display_order?: number;

  @IsOptional()
  @IsString({ message: 'Tiêu đề SEO không hợp lệ' })
  @MaxLength(255, { message: 'Tiêu đề SEO tối đa 255 ký tự' })
  seo_title?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả SEO không hợp lệ' })
  @MaxLength(500, { message: 'Mô tả SEO tối đa 500 ký tự' })
  seo_description?: string;

  @IsOptional()
  @IsString({ message: 'Mã ảnh OG không hợp lệ' })
  @MaxLength(26, { message: 'Mã ảnh OG tối đa 26 ký tự' })
  og_image_id?: string;

  @IsOptional()
  @IsArray({ message: 'Danh sách ảnh phải là mảng' })
  @IsString({ each: true, message: 'Mã ảnh không hợp lệ' })
  image_ids?: string[];
}
