import { IsString, IsOptional, IsNumber, IsNotEmpty, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePackDto {
  @ApiProperty({ description: 'Pack title', required: true })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Pack price', required: false, default: 0 })
  @IsOptional()
  @IsPositive()
  price?: number;

  @ApiProperty({ description: 'Pack description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Status', required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  status?: number;
}