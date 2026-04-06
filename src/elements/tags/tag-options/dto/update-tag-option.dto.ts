import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTagOptionDto {
  @ApiProperty({ description: 'Tag ID', required: false })
  @IsOptional()
  @IsNumber()
  tag_id?: number;

  @ApiProperty({ description: 'Option value', required: false })
  @IsOptional()
  @IsString()
  option_value?: string;
}