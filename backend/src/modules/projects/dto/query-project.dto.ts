import { IsOptional, IsString, IsEnum, IsBooleanString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ProjectStatus } from '../entities/project.entity';

/** Query DTO cho GET /projects (public) */
export class QueryProjectDto extends PaginationDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}

/** Query DTO cho GET /projects/admin/list */
export class QueryProjectAdminDto extends PaginationDto {
  @IsOptional()
  @IsString()
  category_id?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsBooleanString()
  is_featured?: string;
}
