import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class RecordPageviewDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  path!: string;
}
