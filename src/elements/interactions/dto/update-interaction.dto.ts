import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateInteractionDto {
  @ApiProperty({ description: 'Item ID', required: false })
  @IsOptional()
  @IsNumber()
  itemId?: number;

  @ApiProperty({ description: 'User ID', required: false })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty({ description: 'Type', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: 'Value', required: false })
  @IsOptional()
  @IsString()
  value?: string;
}