import { IsNumber, IsOptional, IsPositive, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePackLineDto {
  @ApiProperty({ description: 'Pack ID', required: true })
  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  pack_id: number;

  @ApiProperty({ description: 'Module ID', required: false })
  @IsOptional()
  @IsPositive()
  @IsPositive()
  @IsNumber()
  module_id?: number;

  @ApiProperty({ description: 'Price HT', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  price_ht?: number;

  @ApiProperty({ description: 'TVA value', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  tva_value?: number;

  @ApiProperty({ description: 'Price TTC', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  price_ttc?: number;

  @ApiProperty({ description: 'Discount', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  discount?: number;
}