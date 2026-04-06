import { IsString, IsNotEmpty, IsArray, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: 'Role title', required: true })
  @IsString()
  @IsNotEmpty()
  title: string;

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