import { IsOptional, IsEnum, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ConsultationStatus } from '../entities/consultation.entity';

/** Query DTO cho GET /consultations (admin) */
export class QueryConsultationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ConsultationStatus)
  status?: ConsultationStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
