import { IsObject } from 'class-validator';

export class UpdatePageConfigDto {
  @IsObject()
  config_draft!: Record<string, unknown>;
}
