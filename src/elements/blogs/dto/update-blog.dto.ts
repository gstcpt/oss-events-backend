import { CreateBlogDto, CreateBlogCommentDto, CreateBlogRatingDto, CreateBlogTagDto, CreateBlogCategoryDto, CreateBlogLikeDto, CreateBlogMediaDto } from './create-blog.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateBlogDto extends PartialType(CreateBlogDto) {}

export class UpdateBlogCommentDto extends PartialType(CreateBlogCommentDto) {}

export class UpdateBlogRatingDto extends PartialType(CreateBlogRatingDto) { }

export class UpdateBlogTagDto extends PartialType(CreateBlogTagDto) { }

export class UpdateBlogCategoryDto extends PartialType(CreateBlogCategoryDto) { }

export class UpdateBlogLikeDto extends PartialType(CreateBlogLikeDto) { }

export class UpdateBlogMediaDto extends PartialType(CreateBlogMediaDto) {}