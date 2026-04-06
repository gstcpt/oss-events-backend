import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category title', required: true })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Head category ID', required: false })
  @IsOptional()
  @IsNumber()
  head_category_id?: number;

  @ApiProperty({ description: 'Category image URL', required: true })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiProperty({ description: 'Category description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Company ID', required: false })
  @IsOptional()
  @IsNumber()
  company_id?: number;

  @ApiProperty({ description: 'Status', required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  status?: number;
}