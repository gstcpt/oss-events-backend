import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePackLineDto {
  @ApiProperty({ description: 'Pack ID', required: false })
  @IsOptional()
  @IsPositive()
  @IsNumber()
  pack_id?: number;

  @ApiProperty({ description: 'Module ID', required: false })
  @IsOptional()
  @IsPositive()
  @IsNumber()
  module_id?: number;

  @ApiProperty({ description: 'Price HT', required: false })
  @IsOptional()
  @IsNumber()
  price_ht?: number;

  @ApiProperty({ description: 'TVA value', required: false })
  @IsOptional()
  @IsNumber()
  tva_value?: number;

  @ApiProperty({ description: 'Price TTC', required: false })
  @IsOptional()
  @IsNumber()
  price_ttc?: number;

  @ApiProperty({ description: 'Discount', required: false })
  @IsOptional()
  @IsNumber()
  discount?: number;
}