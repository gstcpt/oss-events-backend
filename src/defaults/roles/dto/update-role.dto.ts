import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({ description: 'Role title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'List of permission IDs',
    required: false,
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds?: number[];
}