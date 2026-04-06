import { PartialType } from '@nestjs/mapped-types';
import { CreateTagDto } from './create-tag.dto';
import { IsArray, IsInt, IsOptional } from 'class-validator';

export class UpdateTagDto extends PartialType(CreateTagDto) {
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    category_ids?: number[];
}