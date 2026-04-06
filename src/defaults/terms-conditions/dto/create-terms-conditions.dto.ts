import { IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTermsConditionsDto {

    @ApiProperty({ description: 'Content', required: true })
    @IsNotEmpty()
    @IsString()
    content: string;

    @ApiProperty({ description: 'Company ID', required: false })
    @IsNumber()
    @IsOptional()
    companyId?: number;
}