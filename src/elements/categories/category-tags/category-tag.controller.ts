import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CategoryTagService } from './category-tag.service';
import { CreateCategoryTagDto } from './dto/create-category-tag.dto';
import { UpdateCategoryTagDto } from './dto/update-category-tag.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';

@ApiTags('Category tags')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('category-tags')
export class CategoryTagController {
  constructor(private readonly categoryTagService: CategoryTagService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new category tag' })
  @ApiResponse({ status: 201, description: 'Category tag created successfully.' })
  create(@Body() createCategoryTagDto: CreateCategoryTagDto) { return this.categoryTagService.create(createCategoryTagDto); }

  @Get()
  @ApiOperation({ summary: 'Get all category tags' })
  @ApiResponse({ status: 200, description: 'List of category tags retrieved successfully.' })
  findAll() { return this.categoryTagService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get category tag by ID' })
  @ApiResponse({ status: 200, description: 'Category tag retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Category tag not found.' })
  findOne(@Param('id') id: string) { return this.categoryTagService.findOne(+id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category tag by ID' })
  @ApiResponse({ status: 200, description: 'Category tag updated successfully.' })
  @ApiResponse({ status: 404, description: 'Category tag not found.' })
  update(@Param('id') id: string, @Body() updateCategoryTagDto: UpdateCategoryTagDto) { return this.categoryTagService.update(+id, updateCategoryTagDto); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category tag by ID' })
  @ApiResponse({ status: 200, description: 'Category tag deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Category tag not found.' })
  remove(@Param('id') id: string) { return this.categoryTagService.remove(+id); }
}