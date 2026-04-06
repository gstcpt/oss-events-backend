import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateItemMediaDto {
  @ApiProperty({ description: 'File path', required: false })
  @IsOptional()
  @IsString()
  file?: string;

  @ApiProperty({ description: 'Media type', required: false })
  @IsOptional()
  @IsString()
  mediaType?: string;

  @ApiProperty({ description: 'Item ID', required: false })
  @IsOptional()
  @IsNumber()
  itemId?: number;

  @ApiProperty({ description: 'Company ID', required: false })
  @IsOptional()
  @IsNumber()
  companyId?: number;
}