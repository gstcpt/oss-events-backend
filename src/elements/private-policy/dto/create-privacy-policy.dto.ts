import { IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePrivacyPolicyDto {
    @ApiProperty({ description: 'Content', required: true })
    @IsNotEmpty()
    content: string;

    @ApiProperty({ description: 'Company ID', required: false })
    @IsNumber()
    @IsOptional()
    companyId?: number;
}