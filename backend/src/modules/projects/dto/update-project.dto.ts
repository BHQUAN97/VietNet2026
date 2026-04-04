import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsArray,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus } from '../entities/project.entity';

export class UpdateProjectDto {
  @IsOptional()
  @IsString({ message: 'Tiêu đề không hợp lệ' })
  @MinLength(2, { message: 'Tiêu đề cần ít nhất 2 ký tự' })
  @MaxLength(255, { message: 'Tiêu đề tối đa 255 ký tự' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả không hợp lệ' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Nội dung không hợp lệ' })
  content?: string;

  @IsOptional()
  @IsString({ message: 'Mã danh mục không hợp lệ' })
  @MaxLength(26, { message: 'Mã danh mục tối đa 26 ký tự' })
  category_id?: string;

  @IsOptional()
  @IsString({ message: 'Phong cách không hợp lệ' })
  @MaxLength(100, { message: 'Phong cách tối đa 100 ký tự' })
  style?: string;

  @IsOptional()
  @IsArray({ message: 'Danh sách vật liệu phải là mảng' })
  @IsString({ each: true, message: 'Tên vật liệu không hợp lệ' })
  materials?: string[];

  @IsOptional()
  @IsString({ message: 'Diện tích không hợp lệ' })
  @MaxLength(50, { message: 'Diện tích tối đa 50 ký tự' })
  area?: string;

  @IsOptional()
  @IsString({ message: 'Thời gian thi công không hợp lệ' })
  @MaxLength(50, { message: 'Thời gian thi công tối đa 50 ký tự' })
  duration?: string;

  @IsOptional()
  @IsString({ message: 'Địa điểm không hợp lệ' })
  @MaxLength(255, { message: 'Địa điểm tối đa 255 ký tự' })
  location?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Năm hoàn thành phải là số nguyên' })
  @Min(1900, { message: 'Năm hoàn thành phải từ 1900 trở lên' })
  year_completed?: number;

  @IsOptional()
  @IsString({ message: 'Mã ảnh bìa không hợp lệ' })
  @MaxLength(26, { message: 'Mã ảnh bìa tối đa 26 ký tự' })
  cover_image_id?: string;

  @IsOptional()
  @IsEnum(ProjectStatus, { message: 'Trạng thái dự án không hợp lệ' })
  status?: ProjectStatus;

  @IsOptional()
  @IsBoolean({ message: 'Giá trị nổi bật phải là true hoặc false' })
  is_featured?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Thứ tự hiển thị phải là số nguyên' })
  @Min(0, { message: 'Thứ tự hiển thị không được âm' })
  display_order?: number;

  @IsOptional()
  @IsString({ message: 'Mã tham chiếu không hợp lệ' })
  @MaxLength(20, { message: 'Mã tham chiếu tối đa 20 ký tự' })
  ref_code?: string;

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
  gallery_ids?: string[];
}
