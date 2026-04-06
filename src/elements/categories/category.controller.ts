import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@ApiTags('Categories')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Post()
  @RequirePermissions('categories.create')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully.' })
  create(@Body() createCategoryDto: CreateCategoryDto, @Req() req: any) {
    const userId = req.user.id;
    return this.categoryService.create(createCategoryDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'List of categories retrieved successfully.' })
  findAll() { return this.categoryService.findAll(); }

  @Get('sub-categories/:parentId')
  @ApiOperation({ summary: 'Get all sub-categories for a given parent' })
  @ApiResponse({ status: 200, description: 'List of sub-categories retrieved successfully.' })
  findAllSubCategories(@Param('parentId') parentId: string) { return this.categoryService.findAllSubCategories(+parentId); }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get all categories by company' })
  @ApiResponse({ status: 200, description: 'List of categories by company retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'No categories found for this company.' })
  findAllByCompany(@Param('companyId') companyId: string) { return this.categoryService.findAllByCompany(+companyId); }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  findOne(@Param('id') id: string) { return this.categoryService.findOne(+id); }

  @Patch(':id')
  @RequirePermissions('categories.update')
  @ApiOperation({ summary: 'Update category by ID' })
  @ApiResponse({ status: 200, description: 'Category updated successfully.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto, @Req() req: any) {
    const userId = req.user.id;
    return this.categoryService.update(+id, updateCategoryDto, userId);
  }

  @Post('upload/image')
  @RequirePermissions('categories.image.update')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        try {
          const uploadPath = join(process.cwd(), '..', 'frontend', 'public', 'images', 'categories');
          if (!existsSync(uploadPath)) { mkdirSync(uploadPath, { recursive: true }); }
          cb(null, uploadPath);
        } catch (error) { cb(error, ''); }
      },
      filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = extname(file.originalname);
        const tempFilename = `temp-${timestamp}${ext}`;
        cb(null, tempFilename);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) { return cb(new BadRequestException('Only image files are allowed'), false); }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Body('categoryId') categoryId: string, @Body('categoryTitle') categoryTitle: string) {
    try {
      if (!file) { throw new BadRequestException('No file uploaded'); }
      const ext = extname(file.originalname);
      const safeName = (categoryTitle || 'category').replace(/[^a-zA-Z0-9]/g, '-');
      const timestamp = Date.now();
      const newFilename = `${categoryId || 'unknown'}-${safeName}-${timestamp}${ext}`;
      const oldPath = file.path;
      const newPath = join(file.destination, newFilename);
      require('fs').renameSync(oldPath, newPath);
      const imageUrl = `images/categories/${newFilename}`;
      return { imageUrl };
    } catch (error) { throw new BadRequestException(`Upload failed: ${error.message}`); }
  }

  @Delete(':id')
  @RequirePermissions('categories.delete')
  @ApiOperation({ summary: 'Delete category by ID' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.categoryService.remove(+id, userId);
  }
}