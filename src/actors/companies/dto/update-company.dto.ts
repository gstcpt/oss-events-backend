import { IsString, IsOptional, IsDateString, MinLength, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCompanyDto {
  @ApiProperty({ description: 'Admin user ID', required: false })
  @IsOptional()
  @IsNumber()
  admin_id?: number;

  @ApiProperty({ description: 'Company title', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @ApiProperty({ description: 'Company url', required: false })
  @IsOptional()
  @IsString()
  @MinLength(8)
  url?: string;

  @ApiProperty({ description: 'Company logo URL', required: false })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ description: 'Company favicon URL', required: false })
  @IsOptional()
  @IsString()
  favicon?: string;

  @ApiProperty({ description: 'Company matricule', required: false })
  @IsOptional()
  @IsString()
  matricule?: string;

  @ApiProperty({ description: 'Company domain', required: false })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiProperty({ description: 'Foundation date', required: false })
  @IsOptional()
  @IsDateString()
  date_foundation?: string;

  @ApiProperty({ description: 'Company about description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Company contact information', required: false })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiProperty({ description: 'Company status', required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  status?: number;

  @ApiProperty({ description: 'Company tel', required: false })
  @IsOptional()
  @IsString()
  tel?: string;

  @ApiProperty({ description: 'Company email', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: 'Company address', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Company country ID', required: false })
  @IsOptional()
  @IsNumber()
  country_id?: number;

  @ApiProperty({ description: 'Company governorat ID', required: false })
  @IsOptional()
  @IsNumber()
  governorat_id?: number;

  @ApiProperty({ description: 'Company municipality ID', required: false })
  @IsOptional()
  @IsNumber()
  municipality_id?: number;

  @ApiProperty({ description: 'Company facebook url', required: false })
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiProperty({ description: 'Company instagram url', required: false })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiProperty({ description: 'Company tiktok url', required: false })
  @IsOptional()
  @IsString()
  tiktok?: string;

  @ApiProperty({ description: 'Company linkedin url', required: false })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiProperty({ description: 'Company twitter url', required: false })
  @IsOptional()
  @IsString()
  twitter?: string;

  @ApiProperty({ description: 'Company youtube url', required: false })
  @IsOptional()
  @IsString()
  youtube?: string;
}