import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCountryDto {
    @ApiProperty({ description: 'Country name' })
    @IsString()
    @IsNotEmpty()
    name: string;
}

export class CreateGovernorateDto {
    @ApiProperty({ description: 'Governorate name' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Country ID' })
    @IsNumber()
    @IsNotEmpty()
    country_id: number;
}

export class CreateMunicipalityDto {
    @ApiProperty({ description: 'Municipality name' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Postal code' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ description: 'Governorate ID' })
    @IsNumber()
    @IsNotEmpty()
    governorate_id: number;
}