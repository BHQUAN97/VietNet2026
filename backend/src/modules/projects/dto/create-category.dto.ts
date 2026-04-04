import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CategoryType } from '../entities/category.entity';

export class CreateCategoryDto {
  @IsString({ message: 'Tên danh mục không hợp lệ' })
  @MinLength(2, { message: 'Tên danh mục cần ít nhất 2 ký tự' })
  @MaxLength(100, { message: 'Tên danh mục tối đa 100 ký tự' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'Mô tả không hợp lệ' })
  description?: string;

  @IsEnum(CategoryType, { message: 'Loại danh mục không hợp lệ' })
  type!: CategoryType;

  @IsOptional()
  @IsString({ message: 'Mã danh mục cha không hợp lệ' })
  @MaxLength(26, { message: 'Mã danh mục cha tối đa 26 ký tự' })
  parent_id?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Thứ tự hiển thị phải là số nguyên' })
  @Min(0, { message: 'Thứ tự hiển thị không được âm' })
  display_order?: number;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái kích hoạt phải là true hoặc false' })
  is_active?: boolean;
}
