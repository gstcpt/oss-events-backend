import { Body, Controller, Delete, Get, Param, Patch, Post, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { CreateBlogDto, CreateBlogCommentDto, CreateBlogRatingDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { BlogService } from './blog.service';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { blogImageMulterConfig } from '../../upload/upload.service';
import { UploadService } from '../../upload/upload.service';

@ApiTags('Blogs')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService, private readonly uploadService: UploadService,) { }

  @Post()
  @RequirePermissions('blogs.create')
  @UseInterceptors(AnyFilesInterceptor(blogImageMulterConfig))
  async createBlog(@Body() createBlogDto: CreateBlogDto, @UploadedFiles() files: Express.Multer.File[], @User() currentUser: any) {
    if (files && files.length > 0) {
      const imageFile = files.find(file => file.fieldname === 'image') || files[0];
      if (imageFile) {
        const uploadedFile = this.uploadService.uploadBlogImage(imageFile);
        createBlogDto.image = uploadedFile.url;
      }
    }
    return this.blogService.createBlog(createBlogDto, Number(currentUser.id), files);
  }

  @Post(':id/media')
  @RequirePermissions('blogs.media.create')
  async createBlogMedia(@Param('id') blogId: string, @Body() createBlogMediaDto: any, @User() currentUser: any) {
    createBlogMediaDto.blog_id = Number(blogId);
    return this.blogService.create(createBlogMediaDto);
  }

  @Post(':id/comments')
  @RequirePermissions('blogs.comment.create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createBlogComment(@Param('id') blogId: string, @Body() createBlogCommentDto: CreateBlogCommentDto, @User() currentUser: any) {
    createBlogCommentDto.blog_id = Number(blogId);
    return this.blogService.createBlogComment(createBlogCommentDto, Number(currentUser.id));
  }

  @Post(':id/ratings')
  @RequirePermissions('blogs.rating.create')
  async createBlogRating(@Param('id') blogId: string, @Body() createBlogRatingDto: CreateBlogRatingDto, @User() currentUser: any) {
    createBlogRatingDto.blog_id = Number(blogId);
    return this.blogService.createBlogRating(createBlogRatingDto, Number(currentUser.id));
  }

  @Get(':id/comments')
  async getBlogComments(@Param('id') blogId: string) { return this.blogService.getBlogComments(Number(blogId)); }

  @Get(':id/rating')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getBlogRating(@Param('id') blogId: string, @User() currentUser: any) { return this.blogService.getBlogRating(Number(blogId), Number(currentUser.id)); }

  @Get(':id/average-rating')
  async getBlogAverageRating(@Param('id') blogId: string) { return this.blogService.getBlogAverageRating(Number(blogId)); }

  @Get(':id/ratings/average')
  @ApiOperation({ summary: 'Get the average rating for a blog post' })
  @ApiResponse({ status: 200, description: 'Average rating retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Blog not found.' })
  getAverageRating(@Param('id') id: string) { return this.blogService.getAverageRating(Number(id)); }

  @Get()
  getBlogs(@User() currentUser: any) { return this.blogService.getBlogs(Number(currentUser.id)); }

  @Get(':id')
  getBlogDetails(@Param('id') id: string, @User() currentUser: any) { return this.blogService.getBlogDetails(+id, Number(currentUser.id)); }

  @Get(':id/media')
  getBlogMedia(@Param('id') blogId: string) { return this.blogService.findMediaByBlogId(+blogId); }

  @Patch(':id')
  @RequirePermissions('blogs.update', { checkOwnership: true, resourceEntity: 'blogs', ownerField: 'user_id' })
  @UseInterceptors(AnyFilesInterceptor(blogImageMulterConfig))
  async updateBlog(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto, @UploadedFiles() files: Express.Multer.File[], @User() currentUser: any) {
    if (files && files.length > 0) {
      const imageFile = files.find(file => file.fieldname === 'image') || files[0];
      if (imageFile) {
        const uploadedFile = this.uploadService.uploadBlogImage(imageFile);
        updateBlogDto.image = uploadedFile.url;
      }
    }
    return this.blogService.updateBlog(+id, updateBlogDto, Number(currentUser.id), files);
  }

  @Delete(':id')
  @RequirePermissions('blogs.delete', { checkOwnership: true, resourceEntity: 'blogs', ownerField: 'user_id' })
  deleteBlog(@Param('id') id: string, @User() currentUser: any) { return this.blogService.deleteBlog(+id, Number(currentUser.id)); }

  @Delete('media/:id')
  @RequirePermissions('blogs.media.delete')
  async deleteBlogMedia(@Param('id') mediaId: string, @User() currentUser: any) { return this.blogService.remove(+mediaId); }
}