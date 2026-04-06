import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateFormLineOptionsDto {
    @ApiProperty({ description: 'Tag option ID', required: false })
    @IsOptional()
    @IsNumber()
    tag_option_id?: number;

    @ApiProperty({ description: 'Option value', required: false })
    @IsOptional()
    @IsString()
    option_value?: string;
}

export class CreateFormLinesDto {
    @ApiProperty({ description: 'Form line label', required: false })
    @IsString()
    @IsOptional()
    label?: string;

    @ApiProperty({ description: 'Form line type', required: false })
    @IsString()
    @IsOptional()
    type?: string;

    @ApiProperty({ description: 'Form line icon', required: false })
    @IsString()
    @IsOptional()
    icon?: string;

    @ApiProperty({ description: 'Tag ID', required: false })
    @IsOptional()
    @IsNumber()
    tag_id?: number;

    @ApiProperty({ description: 'Form line position vertical', required: false, default: 1 })
    @IsOptional()
    @IsNumber()
    positionv?: number;

    @ApiProperty({ description: 'Form line position horizontal', required: false, default: 1 })
    @IsOptional()
    @IsNumber()
    positionh?: number;

    @ApiProperty({ description: 'Form line required', required: false, default: true })
    @IsOptional()
    @IsBoolean()
    required?: boolean;

    @ApiProperty({ type: () => [CreateFormLineOptionsDto], description: 'Options for the form line', required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateFormLineOptionsDto)
    form_line_options?: CreateFormLineOptionsDto[];
}

export class CreateFormsDto {
    @ApiProperty({ description: 'Form title' })
    @IsString()
    title: string;

    @ApiProperty({ description: 'Category ID', required: false })
    @IsNumber()
    @IsOptional()
    category_id?: number;

    @ApiProperty({ description: 'Company ID', required: false })
    @IsOptional()
    @IsNumber()
    company_id?: number;

    @ApiProperty({ description: 'User status', required: false, default: 1 })
    @IsOptional()
    @IsNumber()
    status?: number;

    @ApiProperty({ type: () => [CreateFormLinesDto], description: 'Lines of the form', required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateFormLinesDto)
    form_lines?: CreateFormLinesDto[];
}

export class CreateFormItemDto {
    @ApiProperty({ description: 'Form ID', required: false })
    @IsOptional()
    @IsNumber()
    form_id?: number;

    @ApiProperty({ description: 'Item ID', required: false })
    @IsOptional()
    @IsNumber()
    item_id?: number;
}