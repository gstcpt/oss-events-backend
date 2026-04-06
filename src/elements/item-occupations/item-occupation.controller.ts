import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ItemOccupationService } from './item-occupation.service';
import { CreateItemOccupationDto } from './dto/create-item-occupation.dto';
import { UpdateItemOccupationDto } from './dto/update-item-occupation.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('Item occupations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('item-occupations')
export class ItemOccupationController {
  constructor(private readonly itemOccupationService: ItemOccupationService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new item occupation' })
  @ApiResponse({ status: 201, description: 'Item occupation created successfully.' })
  create(@Body() createItemOccupationDto: CreateItemOccupationDto, @User() user: any) { return this.itemOccupationService.create(createItemOccupationDto, user); }

  @Get()
  @ApiOperation({ summary: 'Get all item occupations' })
  @ApiResponse({ status: 200, description: 'List of item occupations retrieved successfully.' })
  findAll(@User() user: any) { return this.itemOccupationService.findAll(user); }

  @Get(':id')
  @ApiOperation({ summary: 'Get item occupation by ID' })
  @ApiResponse({ status: 200, description: 'Item occupation retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Item occupation not found.' })
  findOne(@Param('id') id: string, @User() user: any) { return this.itemOccupationService.findOne(+id, user); }

  @Get('availability/:itemId')
  @ApiOperation({ summary: 'Get availability calendar for an item' })
  @ApiResponse({ status: 200, description: 'Item availability retrieved successfully.' })
  getAvailability(@Param('itemId') itemId: string, @User() user: any) { return this.itemOccupationService.getItemAvailability(+itemId, user); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update item occupation by ID' })
  @ApiResponse({ status: 200, description: 'Item occupation updated successfully.' })
  @ApiResponse({ status: 404, description: 'Item occupation not found.' })
  update(@Param('id') id: string, @Body() updateItemOccupationDto: UpdateItemOccupationDto, @User() user: any) { return this.itemOccupationService.update(+id, updateItemOccupationDto, user); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete item occupation by ID' })
  @ApiResponse({ status: 200, description: 'Item occupation deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Item occupation not found.' })
  remove(@Param('id') id: string, @User() user: any) { return this.itemOccupationService.remove(+id, user); }
}