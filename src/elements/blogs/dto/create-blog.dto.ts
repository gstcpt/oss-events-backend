import { IsString, IsNumber, IsArray, IsDate, IsOptional, IsNotEmpty, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBlogDto {
    @ApiProperty({ description: 'Blog title', required: true })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({ description: 'Blog content', required: true })
    @IsNotEmpty()
    @IsString()
    content: string;

    @ApiProperty({ description: 'Blog image URL', required: false })
    @IsOptional()
    @IsString()
    image?: string;

    @ApiProperty({ description: 'Date posted', required: false })
    @IsOptional()
    @IsString()
    date?: string;

    @ApiProperty({ description: 'Author ID', required: false })
    @IsOptional()
    @IsNumber()
    user_id?: number;

    @ApiProperty({ description: 'Views', required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    views?: number;

    @ApiProperty({ description: 'Shares', required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    shares?: number;

    @ApiProperty({ description: 'Company ID', required: false })
    @IsOptional()
    @IsNumber()
    company_id?: number;

    @ApiProperty({ description: 'Status', required: false, default: 1 })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(1)
    status?: number;

    @ApiProperty({ description: 'Blog tags', required: false, type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiProperty({ description: 'Blog categories', required: false, type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    categories?: string[];
}

export class CreateBlogCommentDto {
    @ApiProperty({ description: 'Blog ID', required: false })
    @IsOptional()
    @IsNumber()
    blog_id: number;

    @ApiProperty({ description: 'User ID', required: false })
    @IsOptional()
    @IsNumber()
    user_id?: number;

    @ApiProperty({ description: 'Comment content', required: true })
    @IsNotEmpty()
    @IsString()
    comment: string;

    @ApiProperty({ description: 'Comment creation date', required: false })
    @IsOptional()
    created_at?: Date;
}

export class CreateBlogRatingDto {
    @ApiProperty({ description: 'Blog ID', required: false })
    @IsOptional()
    @IsNumber()
    blog_id: number;

    @ApiProperty({ description: 'User ID', required: false })
    @IsOptional()
    @IsNumber()
    user_id?: number;

    @ApiProperty({ description: 'Rating value (1-5)', required: true })
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;
}

export class CreateBlogTagDto {
    @ApiProperty({ description: 'Blog ID', required: true })
    @IsNotEmpty()
    @IsNumber()
    blog_id: number;

    @ApiProperty({ description: 'Tag title', required: true })
    @IsNotEmpty()
    @IsString()
    tag_title: string;
}

export class CreateBlogCategoryDto {
    @ApiProperty({ description: 'Blog ID', required: true })
    @IsNotEmpty()
    @IsNumber()
    blog_id: number;

    @ApiProperty({ description: 'Category title', required: true })
    @IsNotEmpty()
    @IsString()
    category_title: string;
}

export class CreateBlogLikeDto {
    @ApiProperty({ description: 'Blog ID', required: true })
    @IsNotEmpty()
    @IsNumber()
    blog_id: number;

    @ApiProperty({ description: 'User ID', required: false })
    @IsOptional()
    @IsNumber()
    user_id?: number;
}

export class CreateBlogMediaDto {
    @ApiProperty({ description: 'Media file URL', required: true })
    @IsNotEmpty()
    @IsString()
    file: string;

    @ApiProperty({ description: 'Media type (image/*, video/*)', required: false })
    @IsOptional()
    @IsString()
    media_type?: string;

    @ApiProperty({ description: 'Blog ID', required: true })
    @IsNotEmpty()
    @IsNumber()
    blog_id: number;

    @ApiProperty({ description: 'Company ID', required: false })
    @IsOptional()
    @IsNumber()
    company_id?: number;
}