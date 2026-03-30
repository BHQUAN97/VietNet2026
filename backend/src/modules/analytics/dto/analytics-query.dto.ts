import { IsOptional, IsISO8601, IsString, MaxLength } from 'class-validator';

export class AnalyticsSummaryQueryDto {
  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'date must be a valid ISO 8601 date string (YYYY-MM-DD)' })
  date?: string;
}

export class AnalyticsPageviewsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  path?: string;

  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'date must be a valid ISO 8601 date string (YYYY-MM-DD)' })
  date?: string;
}

export class AnalyticsDashboardQueryDto {
  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'start must be a valid ISO 8601 date string (YYYY-MM-DD)' })
  start?: string;

  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'end must be a valid ISO 8601 date string (YYYY-MM-DD)' })
  end?: string;
}
