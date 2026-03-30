import { IsString, IsOptional, IsObject, MinLength, MaxLength } from 'class-validator';

export class CreatePageConfigDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  page_slug!: string;

  @IsOptional()
  @IsObject()
  config_draft?: Record<string, unknown>;
}
