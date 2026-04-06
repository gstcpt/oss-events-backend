import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePermissionDto {
  @ApiProperty({ description: 'Permission title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Permission code (unique)', required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ description: 'Module ID', required: false })
  @IsOptional()
  @IsNumber()
  module_id?: number;

  @ApiProperty({ description: 'Status', required: false })
  @IsOptional()
  @IsNumber()
  status?: number;
}