import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppSettingsDto {
  @ApiProperty({ description: 'Settings famille', required: true })
  @IsString()
  @IsNotEmpty()
  famille: string;

  @ApiProperty({ description: 'Settings title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Settings value', required: false })
  @IsOptional()
  @IsString()
  value?: string;
}