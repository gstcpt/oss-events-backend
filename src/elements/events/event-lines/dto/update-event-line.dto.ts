import { IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEventLineDto {
  @ApiProperty({ description: 'Event ID', required: false })
  @IsOptional()
  @IsNumber()
  eventId?: number;

  @ApiProperty({ description: 'Item ID', required: false })
  @IsOptional()
  @IsNumber()
  itemId?: number;

  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Price HT', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  priceHt?: number;

  @ApiProperty({ description: 'TVA value', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  tvaValue?: number;

  @ApiProperty({ description: 'Price TTC', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  priceTtc?: number;

  @ApiProperty({ description: 'Discount', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  discount?: number;
}