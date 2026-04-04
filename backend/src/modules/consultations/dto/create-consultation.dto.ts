import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ConsultationProjectType } from '../entities/consultation.entity';

export class CreateConsultationDto {
  @IsString({ message: 'Họ tên không hợp lệ' })
  @MinLength(2, { message: 'Họ tên cần ít nhất 2 ký tự' })
  @MaxLength(100, { message: 'Họ tên tối đa 100 ký tự' })
  name!: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Số điện thoại không hợp lệ' })
  @MaxLength(20, { message: 'Số điện thoại tối đa 20 ký tự' })
  phone?: string;

  @IsOptional()
  @IsEnum(ConsultationProjectType, {
    message: 'Loại dự án không hợp lệ. Vui lòng chọn: Nhà ở, Thương mại, Khách sạn, Cải tạo, hoặc Khác',
  })
  project_type?: ConsultationProjectType;

  @IsOptional()
  @IsString({ message: 'Diện tích không hợp lệ' })
  @MaxLength(50, { message: 'Diện tích tối đa 50 ký tự' })
  area?: string;

  @IsOptional()
  @IsString({ message: 'Ngân sách không hợp lệ' })
  @MaxLength(100, { message: 'Ngân sách tối đa 100 ký tự' })
  budget_range?: string;

  @IsString({ message: 'Nội dung yêu cầu không hợp lệ' })
  @MinLength(5, { message: 'Nội dung yêu cầu cần ít nhất 5 ký tự' })
  @MaxLength(2000, { message: 'Nội dung yêu cầu tối đa 2000 ký tự' })
  message!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  source?: string;

  @IsOptional()
  @IsString()
  honeypot?: string;
}
