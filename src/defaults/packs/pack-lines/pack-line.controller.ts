import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PackLineService } from './pack-line.service';
import { CreatePackLineDto } from './dto/create-pack-line.dto';
import { UpdatePackLineDto } from './dto/update-pack-line.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';

@ApiTags('Pack lines')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('pack-lines')
export class PackLineController {
  constructor(private readonly packLineService: PackLineService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new pack line' })
  @ApiResponse({ status: 201, description: 'Pack line created successfully.' })
  create(@Body() createPackLineDto: CreatePackLineDto) { return this.packLineService.create(createPackLineDto); }

  @Get()
  @ApiOperation({ summary: 'Get all pack lines' })
  @ApiResponse({ status: 200, description: 'List of pack lines retrieved successfully.' })
  findAll() { return this.packLineService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get pack line by ID' })
  @ApiResponse({ status: 200, description: 'Pack line retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Pack line not found.' })
  findOne(@Param('id') id: Number) { return this.packLineService.findOne(+id); }

  @Get(':packId')
  @ApiOperation({ summary: 'Get pack line by pack ID' })
  @ApiResponse({ status: 200, description: 'Pack line retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Pack line not found.' })
  findByPack(@Param('packId') packId: Number) { return this.packLineService.findByPack(+packId); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update pack line by ID' })
  @ApiResponse({ status: 200, description: 'Pack line updated successfully.' })
  @ApiResponse({ status: 404, description: 'Pack line not found.' })
  update(@Param('id') id: Number, @Body() updatePackLineDto: UpdatePackLineDto) { return this.packLineService.update(+id, updatePackLineDto); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete pack line by ID' })
  @ApiResponse({ status: 200, description: 'Pack line deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Pack line not found.' })
  remove(@Param('id') id: Number) { return this.packLineService.remove(+id); }
}