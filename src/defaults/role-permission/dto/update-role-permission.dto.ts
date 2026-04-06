import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRolePermissionDto {
  @ApiProperty({ description: 'Role ID', required: false })
  @IsOptional()
  @IsNumber()
  role_id?: number;

  @ApiProperty({ description: 'Permission ID', required: false })
  @IsOptional()
  @IsNumber()
  permission_id?: number;
}