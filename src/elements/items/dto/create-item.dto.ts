import { IsString, IsOptional, IsNumber, IsPositive, IsNotEmpty, ValidateNested, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ItemCategoryDto {
  @ApiProperty({ description: 'Category ID', required: true })
  @IsNumber()
  category_id: number;
}

export class FormItemDto {
  @ApiProperty({ description: 'Form ID', required: true })
  @IsNumber()
  form_id: number;
}

export class CreateItemDto {
  @ApiProperty({ description: 'Item title', required: true })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Item code', required: true })
  @IsString()
  @IsOptional()
  code: string;

  @ApiProperty({ description: 'Item image URL', required: true })
  @IsString()
  @IsOptional()
  image: string;

  @ApiProperty({ description: 'Item cover URL', required: true })
  @IsString()
  @IsOptional()
  cover: string;

  @ApiProperty({ description: 'Item description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Item price', required: false, default: 0 })
  @IsOptional()
  @IsPositive()
  price?: number;

  @ApiProperty({ description: 'Provider ID', required: false })
  @IsOptional()
  @IsNumber()
  provider_id?: number;

  @ApiProperty({ description: 'Company ID', required: false })
  @IsOptional()
  @IsNumber()
  company_id?: number;

  @ApiProperty({ description: 'Status', required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  status?: number;

  @ApiProperty({ description: 'Item categories', required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ItemCategoryDto)
  item_category?: ItemCategoryDto[];

  @ApiProperty({ description: 'Form items', required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FormItemDto)
  form_item?: FormItemDto[];

  @ApiProperty({ description: 'Form values', required: false })
  @IsOptional()
  @IsObject()
  form_values?: Record<string, any>;
}