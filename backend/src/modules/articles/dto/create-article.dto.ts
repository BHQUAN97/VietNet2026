import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ArticleStatus } from '../entities/article.entity';

export class CreateArticleDto {
  @IsString({ message: 'Tiêu đề không hợp lệ' })
  @MinLength(2, { message: 'Tiêu đề cần ít nhất 2 ký tự' })
  @MaxLength(255, { message: 'Tiêu đề tối đa 255 ký tự' })
  title!: string;

  @IsOptional()
  @IsString({ message: 'Tóm tắt không hợp lệ' })
  @MaxLength(500, { message: 'Tóm tắt tối đa 500 ký tự' })
  excerpt?: string;

  @IsOptional()
  @IsString({ message: 'Nội dung không hợp lệ' })
  content?: string;

  @IsOptional()
  @IsString({ message: 'Mã danh mục không hợp lệ' })
  @MaxLength(26, { message: 'Mã danh mục tối đa 26 ký tự' })
  category_id?: string;

  @IsOptional()
  @IsString({ message: 'Mã ảnh bìa không hợp lệ' })
  @MaxLength(26, { message: 'Mã ảnh bìa tối đa 26 ký tự' })
  cover_image_id?: string;

  @IsOptional()
  @IsEnum(ArticleStatus, { message: 'Trạng thái bài viết không hợp lệ' })
  status?: ArticleStatus;

  // Lịch đăng — null để huỷ lịch. Chấp nhận ISO 8601 hoặc null.
  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsDateString({}, { message: 'Thời điểm đăng theo lịch không hợp lệ' })
  scheduled_publish_at?: string | null;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 1 || value === '1' || value === 'true')
  @IsBoolean({ message: 'Giá trị nổi bật phải là true hoặc false' })
  is_featured?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Thứ tự hiển thị phải là số nguyên' })
  @Min(0, { message: 'Thứ tự hiển thị không được âm' })
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
}
