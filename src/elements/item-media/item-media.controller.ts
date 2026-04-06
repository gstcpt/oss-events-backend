import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ItemMediaService } from './item-media.service';
import { CreateItemMediaDto } from './dto/create-item-media.dto';
import { UpdateItemMediaDto } from './dto/update-item-media.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Item media')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('item-media')
export class ItemMediaController {
  constructor(private readonly itemMediaService: ItemMediaService) { }

  @Post()
  @ApiOperation({ summary: 'Create new item media' })
  @ApiResponse({ status: 201, description: 'Item media created successfully.' })
  create(@Body() createItemMediaDto: CreateItemMediaDto) { return this.itemMediaService.create(createItemMediaDto); }

  @Get()
  @ApiOperation({ summary: 'Get all item media' })
  @ApiResponse({ status: 200, description: 'List of item media retrieved successfully.' })
  findAll() { return this.itemMediaService.findAll(); }

  @Get('grouped')
  @ApiOperation({ summary: 'Get all item media grouped by item' })
  @ApiResponse({ status: 200, description: 'Item media grouped by item retrieved successfully.' })
  findAllGroupedByItem() { return this.itemMediaService.findAllGroupedByItem(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get item media by ID' })
  @ApiResponse({ status: 200, description: 'Item media retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Item media not found.' })
  findOne(@Param('id') id: string) { return this.itemMediaService.findOne(+id); }

  @Get('item/:itemId')
  @ApiOperation({ summary: 'Get media by item ID' })
  @ApiResponse({ status: 200, description: 'Media for item retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'No media found for this item.' })
  findMediaByItemId(@Param('itemId') itemId: string) { return this.itemMediaService.findMediaByItemId(+itemId); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update item media by ID' })
  @ApiResponse({ status: 200, description: 'Item media updated successfully.' })
  @ApiResponse({ status: 404, description: 'Item media not found.' })
  update(@Param('id') id: string, @Body() updateItemMediaDto: UpdateItemMediaDto) { return this.itemMediaService.update(+id, updateItemMediaDto); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete item media by ID' })
  @ApiResponse({ status: 200, description: 'Item media deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Item media not found.' })
  remove(@Param('id') id: string) { return this.itemMediaService.remove(Number(id)); }
}