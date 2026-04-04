import { IsArray, IsString, ArrayMaxSize } from 'class-validator';

export class UpdateImagesDto {
  @IsArray({ message: 'Danh sách ảnh phải là mảng' })
  @IsString({ each: true, message: 'Mã ảnh không hợp lệ' })
  @ArrayMaxSize(50, { message: 'Tối đa 50 ảnh' })
  image_ids!: string[];
}
