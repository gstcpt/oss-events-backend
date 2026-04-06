import { IsNumber, IsOptional, IsDateString, IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Pack ID', required: false })
  @IsOptional()
  @IsNumber()
  pack_id?: number;

  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiProperty({ description: 'End date', required: false })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiProperty({ description: 'Company ID', required: false })
  @IsOptional()
  @IsNumber()
  company_id?: number;

  @ApiProperty({ description: 'Status', required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  status?: number;

  @ApiProperty({ description: 'Current user context', required: false })
  @IsOptional()
  @IsObject()
  currentUser?: any;
}