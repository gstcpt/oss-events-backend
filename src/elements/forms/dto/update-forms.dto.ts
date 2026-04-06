import { PartialType } from '@nestjs/mapped-types';
import { CreateFormsDto, CreateFormLinesDto, CreateFormLineOptionsDto, CreateFormItemDto } from './create-forms.dto';
import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateFormLineOptionsDto extends PartialType(CreateFormLineOptionsDto) {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    id?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    form_line_id?: number;
}

export class UpdateFormLinesDto extends PartialType(CreateFormLinesDto) {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    id?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    form_id?: number;

    @ApiProperty({ type: () => [UpdateFormLineOptionsDto], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateFormLineOptionsDto)
    form_line_options?: UpdateFormLineOptionsDto[];
}

export class UpdateFormsDto extends PartialType(CreateFormsDto) {
    @ApiProperty({ type: () => [UpdateFormLinesDto], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateFormLinesDto)
    form_lines?: UpdateFormLinesDto[];
}

export class UpdateFormItemDto extends PartialType(CreateFormItemDto) {}