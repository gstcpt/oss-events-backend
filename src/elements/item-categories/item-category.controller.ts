import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ItemCategoryService } from './item-category.service';
import { CreateItemCategoryDto } from './dto/create-item-category.dto';
import { UpdateItemCategoryDto } from './dto/update-item-category.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Item categories')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('item-categories')
export class ItemCategoryController {
  constructor(private readonly itemCategoryService: ItemCategoryService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new item category' })
  @ApiResponse({ status: 201, description: 'Item category created successfully.' })
  create(@Body() createItemCategoryDto: CreateItemCategoryDto) { return this.itemCategoryService.create(createItemCategoryDto); }

  @Get()
  @ApiOperation({ summary: 'Get all item categories' })
  @ApiResponse({ status: 200, description: 'List of item categories retrieved successfully.' })
  findAll() { return this.itemCategoryService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get item category by ID' })
  @ApiResponse({ status: 200, description: 'Item category retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Item category not found.' })
  findOne(@Param('id') id: string) { return this.itemCategoryService.findOne(+id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update item category by ID' })
  @ApiResponse({ status: 200, description: 'Item category updated successfully.' })
  @ApiResponse({ status: 404, description: 'Item category not found.' })
  update(@Param('id') id: string, @Body() updateItemCategoryDto: UpdateItemCategoryDto) { return this.itemCategoryService.update(+id, updateItemCategoryDto); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete item category by ID' })
  @ApiResponse({ status: 200, description: 'Item category deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Item category not found.' })
  remove(@Param('id') id: string) { return this.itemCategoryService.remove(+id); }
}