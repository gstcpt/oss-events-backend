import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanySettingsDto {
  @ApiProperty({ description: 'App settings ID', required: true })
  @IsNumber()
  app_settings_id: number;

  @ApiProperty({ description: 'Custom value', required: false })
  @IsOptional()
  @IsString()
  custom_value?: string;

  @ApiProperty({ description: 'Company ID', required: false })
  @IsOptional()
  @IsNumber()
  company_id?: number;

  @ApiProperty({ description: 'Status', required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  status?: number;
}