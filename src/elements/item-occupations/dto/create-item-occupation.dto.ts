import { IsNumber, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemOccupationDto {
  @ApiProperty({ description: 'Item ID', required: true })
  @IsNumber()
  @IsNotEmpty()
  item_id: number;

  @ApiProperty({ description: 'Event line ID', required: false })
  @IsOptional()
  @IsNumber()
  event_line_id?: number;

  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiProperty({ description: 'End date', required: false })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiProperty({ description: 'Status', required: false })
  @IsOptional()
  @IsNumber()
  status?: number;
}