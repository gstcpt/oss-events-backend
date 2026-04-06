import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryTagDto {
  @ApiProperty({ description: 'Category ID', required: true })
  @IsNumber()
  @IsNotEmpty()
  category_id: number;

  @ApiProperty({ description: 'Tag ID', required: true })
  @IsNumber()
  @IsNotEmpty()
  tag_id: number;
}