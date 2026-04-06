import { IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateItemOccupationDto {
  @ApiProperty({ description: 'Item ID', required: false })
  @IsOptional()
  @IsNumber()
  itemId?: number;

  @ApiProperty({ description: 'Event line ID', required: false })
  @IsOptional()
  @IsNumber()
  eventLineId?: number;

  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Status', required: false })
  @IsOptional()
  @IsNumber()
  status?: number;
}