import { IsNumber, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagOptionDto {
  @ApiProperty({ description: 'Tag ID', required: true })
  @IsNumber()
  @IsNotEmpty()
  tag_id: number;

  @ApiProperty({ description: 'Option value', required: false })
  @IsOptional()
  @IsString()
  option_value?: string;
}