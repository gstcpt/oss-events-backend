import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryTagDto {
  @ApiProperty({ description: 'Category ID', required: false })
  @IsOptional()
  @IsNumber()
  category_id?: number;

  @ApiProperty({ description: 'Tag ID', required: false })
  @IsOptional()
  @IsNumber()
  tag_id?: number;
}