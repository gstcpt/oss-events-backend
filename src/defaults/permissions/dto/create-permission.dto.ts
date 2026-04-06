import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ description: 'Permission title', required: true })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Permission code (unique)', required: true })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Module ID', required: false })
  @IsOptional()
  @IsNumber()
  module_id?: number;

  @ApiProperty({ description: 'Status', required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  status?: number;
}