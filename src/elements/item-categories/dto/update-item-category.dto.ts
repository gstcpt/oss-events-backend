import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateItemCategoryDto {
  @ApiProperty({ description: 'Item ID', required: false })
  @IsOptional()
  @IsNumber()
  item_id?: number;

  @ApiProperty({ description: 'Category ID', required: false })
  @IsOptional()
  @IsNumber()
  category_id?: number;
}