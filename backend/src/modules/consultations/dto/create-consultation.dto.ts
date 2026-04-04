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
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsEnum(ConsultationProjectType)
  project_type?: ConsultationProjectType;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  area?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  budget_range?: string;

  @IsString()
  @MinLength(5, { message: 'Nội dung yêu cầu cần ít nhất 5 ký tự' })
  @MaxLength(2000)
  message!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  source?: string;

  @IsOptional()
  @IsString()
  honeypot?: string;
}
