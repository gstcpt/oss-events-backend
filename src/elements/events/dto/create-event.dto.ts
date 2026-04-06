import { IsNumber, IsOptional, IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ description: 'Client ID', required: true })
  @IsNotEmpty()
  @IsNumber()
  client_id: number;

  @ApiProperty({ description: 'Title', required: true })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Category', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiProperty({ description: 'End date', required: false })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiProperty({ description: 'Number of guests', required: false })
  @IsOptional()
  @IsNumber()
  guests?: number;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Status', required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  status?: number;

  @ApiProperty({ description: 'Company ID', required: true })
  @IsNotEmpty()
  @IsNumber()
  companyId: number;
}