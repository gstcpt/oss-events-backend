import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ description: 'Tag icon', required: true })
  @IsString()
  @IsNotEmpty()
  icon: string;

  @ApiProperty({ description: 'Tag title', required: true })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Tag type', required: false })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ description: 'Filter Option', required: false, default: 0 })
  @IsNumber()
  @IsOptional()
  filter_option: number;

  @ApiProperty({ description: 'Company ID', required: false })
  @IsNumber()
  @IsOptional()
  company_id?: number;

  @ApiProperty({ description: 'Status', required: false, default: 1 })
  @IsNumber()
  @IsOptional()
  status: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  category_ids?: number[];
}