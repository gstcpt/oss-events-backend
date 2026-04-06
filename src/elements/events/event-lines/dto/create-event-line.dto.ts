
import { IsNumber, IsOptional, IsDateString, IsPositive, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventLineDto {
  @ApiProperty({ description: 'Event ID', required: true })
  @IsNumber()
  @IsNotEmpty()
  event_id: number;

  @ApiProperty({ description: 'Item ID', required: false })
  @IsOptional()
  @IsNumber()
  item_id?: number;

  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiProperty({ description: 'End date', required: false })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiProperty({ description: 'Price HT', required: false, default: 0 })
  @IsOptional()
  @IsPositive()
  price_ht?: number;

  @ApiProperty({ description: 'TVA value', required: false, default: 0 })
  @IsOptional()
  @IsPositive()
  tva_value?: number;

  @ApiProperty({ description: 'Price TTC', required: false, default: 0 })
  @IsOptional()
  @IsPositive()
  price_ttc?: number;

  @ApiProperty({ description: 'Discount', required: false, default: 0 })
  @IsOptional()
  @IsPositive()
  discount?: number;
}
