import { IsArray, IsString, ArrayMaxSize } from 'class-validator';

export class UpdateImagesDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  image_ids!: string[];
}
