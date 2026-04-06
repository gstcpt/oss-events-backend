import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRolePermissionDto {
  @ApiProperty({ description: 'Role ID', required: true })
  @IsNumber()
  @IsNotEmpty()
  roleId: number;

  @ApiProperty({ description: 'Permission ID', required: true })
  @IsNumber()
  @IsNotEmpty()
  permissionId: number;
}