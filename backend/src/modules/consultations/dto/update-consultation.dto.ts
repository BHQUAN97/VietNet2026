import { IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';
import { ConsultationStatus } from '../entities/consultation.entity';

export class UpdateConsultationDto {
  @IsOptional()
  @IsEnum(ConsultationStatus)
  status?: ConsultationStatus;

  @IsOptional()
  @IsString()
  @MaxLength(26)
  assigned_to?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}
