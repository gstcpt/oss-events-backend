import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemCategoryDto {
  @ApiProperty({ description: 'Item ID', required: true })
  @IsNumber()
  @IsNotEmpty()
  item_id: number;

  @ApiProperty({ description: 'Category ID', required: true })
  @IsNumber()
  @IsNotEmpty()
  category_id: number;
}