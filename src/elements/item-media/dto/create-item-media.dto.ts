import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemMediaDto {
  @ApiProperty({ description: 'File path or URL', required: true })
  @IsString()
  @IsNotEmpty()
  file: string;

  @ApiProperty({ description: 'Media type', required: false })
  @IsOptional()
  @IsString()
  media_type?: string;

  @ApiProperty({ description: 'Item ID', required: false })
  @IsOptional()
  @IsNumber()
  item_id?: number;

  @ApiProperty({ description: 'Company ID', required: false })
  @IsOptional()
  @IsNumber()
  company_id?: number;
}