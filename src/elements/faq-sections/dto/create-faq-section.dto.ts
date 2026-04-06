import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFaqSectionDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    companyId?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    status?: number;
}
