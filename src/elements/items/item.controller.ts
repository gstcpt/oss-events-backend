import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('Items')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) { }

  @Post()
  @RequirePermissions('items.create')
  @ApiOperation({ summary: 'Create a new item' })
  @ApiResponse({ status: 201, description: 'Item created successfully.' })
  create(@Body() createItemDto: CreateItemDto, @User() user: any) { return this.itemService.create(createItemDto, user); }

  @Post(':id/media')
  @RequirePermissions('items.media.create', { checkOwnership: true, resourceEntity: 'items', ownerField: 'provider_id' })
  @ApiOperation({ summary: 'Add media to item' })
  @ApiResponse({ status: 201, description: 'Media added to item successfully.' })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  addMediaToItem(@Param('id') id: string, @Body() createItemMediaDto: any, @User() user: any) { return this.itemService.addMediaToItem(+id, createItemMediaDto, user); }

  @Get()
  @ApiOperation({ summary: 'Get all items' })
  @ApiResponse({ status: 200, description: 'List of items retrieved successfully.' })
  findAll(@User() user: any) { return this.itemService.findAll(user); }

  @Get(':id')
  @ApiOperation({ summary: 'Get item by ID' })
  @ApiResponse({ status: 200, description: 'Item retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  findOne(@Param('id') id: string, @User() user: any) { return this.itemService.findOne(+id, user); }

  @Patch(':id')
  @RequirePermissions('items.update', { checkOwnership: true, resourceEntity: 'items', ownerField: 'provider_id' })
  @ApiOperation({ summary: 'Update item by ID' })
  @ApiResponse({ status: 200, description: 'Item updated successfully.' })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto, @User() user: any) { return this.itemService.update(+id, updateItemDto, user); }

  @Delete(':id')
  @RequirePermissions('items.delete', { checkOwnership: true, resourceEntity: 'items', ownerField: 'provider_id' })
  @ApiOperation({ summary: 'Delete item by ID' })
  @ApiResponse({ status: 200, description: 'Item deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  remove(@Param('id') id: string, @User() user: any) { return this.itemService.remove(+id, user); }
}