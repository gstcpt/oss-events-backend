import { IsOptional, IsInt, IsString, IsDateString, IsBoolean, IsObject } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetVisitorsDto {
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class GetSessionsDto {
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  visitorId?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class GetPageViewsDto {
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  sessionId?: number;

  @IsOptional()
  @IsString()
  resourceType?: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  resourceId?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class GetAudienceStatsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  resourceType?: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  resourceId?: number;
}

export class CreateVisitorDto {
  @IsString()
  clientId: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  userId?: number;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  device?: string;

  @IsOptional()
  @IsString()
  os?: string;

  @IsOptional()
  @IsString()
  browser?: string;

  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsString()
  ipHash?: string;
}

export class CreateSessionDto {
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  visitorId: number;

  @IsString()
  sessionUuid: string;

  @IsOptional()
  @IsString()
  entryUrl?: string;

  @IsOptional()
  @IsString()
  entryResource?: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  entryResourceId?: number;

  @IsOptional()
  @IsString()
  referrer?: string;

  @IsOptional()
  @IsString()
  utmSource?: string;

  @IsOptional()
  @IsString()
  utmMedium?: string;

  @IsOptional()
  @IsString()
  utmCampaign?: string;
}

export class CreatePageViewDto {
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  sessionId: number;

  @IsInt()
  @Transform(({ value }) => parseInt(value))
  visitorId: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  userId?: number;

  @IsOptional()
  @IsString()
  resourceType?: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  resourceId?: number;

  @IsString()
  path: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsObject()
  query?: Record<string, any>;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  durationMs?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  scrollDepthPct?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  interactions?: number;

  @IsOptional()
  @IsBoolean()
  isBounce?: boolean;

  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
}

export class CreatePageEventDto {
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  pageViewId: number;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, any>;
}