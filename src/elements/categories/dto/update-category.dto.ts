import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiProperty({ description: 'Category title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Head category ID', required: false })
  @IsOptional()
  @IsNumber()
  head_category_id?: number;

  @ApiProperty({ description: 'Category image URL', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ description: 'Category description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Company ID', required: false })
  @IsOptional()
  @IsNumber()
  company_id?: number;

  @ApiProperty({ description: 'Status', required: false })
  @IsOptional()
  @IsNumber()
  status?: number;
}