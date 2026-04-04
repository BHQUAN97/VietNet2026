import { IsObject } from 'class-validator';

export class UpdatePageConfigDto {
  @IsObject({ message: 'Cấu hình bản nháp phải là object' })
  config_draft!: Record<string, unknown>;
}
