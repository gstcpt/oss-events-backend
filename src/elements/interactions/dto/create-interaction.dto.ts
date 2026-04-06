import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInteractionDto {
  @ApiProperty({ description: 'Item ID', required: false })
  @IsOptional()
  @IsNumber()
  item_id?: number;

  @ApiProperty({ description: 'User ID', required: false })
  @IsOptional()
  @IsNumber()
  user_id?: number;

  @ApiProperty({ description: 'Interaction type', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: 'Interaction value', required: false })
  @IsOptional()
  @IsString()
  value?: string;
}