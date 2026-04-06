import { IsString, IsOptional, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePackDto {
  @ApiProperty({ description: 'Pack title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Pack price', required: false })
  @IsOptional()
  @IsPositive()
  price?: number;

  @ApiProperty({ description: 'Pack description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Status', required: false })
  @IsOptional()
  @IsNumber()
  status?: number;
}