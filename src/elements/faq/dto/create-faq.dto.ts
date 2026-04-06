import { IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFAQDto {
    @ApiProperty({ description: 'Question', required: true })
    @IsNotEmpty()
    question: string;

    @ApiProperty({ description: 'Answer', required: true })
    @IsNotEmpty()
    answer: string;

    @ApiProperty({ description: 'FAQ Order', required: true })
    @IsNumber()
    @IsNotEmpty()
    faqOrder: number;

    @ApiProperty({ description: 'Section ID', required: false })
    @IsNumber()
    @IsOptional()
    sectionId?: number;

    @ApiProperty({ description: 'Company ID', required: false })
    @IsNumber()
    @IsOptional()
    companyId?: number;

    @ApiProperty({ description: 'Status', required: false, default: 1 })
    @IsOptional()
    @IsNumber()
    status?: number;
}