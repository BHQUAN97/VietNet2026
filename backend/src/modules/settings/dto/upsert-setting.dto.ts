import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpsertSettingDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  value!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  group!: string;
}
