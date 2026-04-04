import { IsString, IsOptional, IsObject, MinLength, MaxLength } from 'class-validator';

export class CreatePageConfigDto {
  @IsString({ message: 'Slug trang không hợp lệ' })
  @MinLength(2, { message: 'Slug trang cần ít nhất 2 ký tự' })
  @MaxLength(100, { message: 'Slug trang tối đa 100 ký tự' })
  page_slug!: string;

  @IsOptional()
  @IsObject({ message: 'Cấu hình bản nháp phải là object' })
  config_draft?: Record<string, unknown>;
}
