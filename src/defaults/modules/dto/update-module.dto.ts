import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateModuleDto {
  @ApiProperty({ description: 'Module title', required: false })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Module code', required: false })
  @IsString()
  @IsOptional()
  code: string;
}