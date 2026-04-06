import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PacksService } from './pack.service';
import { CreatePackDto } from './dto/create-pack.dto';
import { UpdatePackDto } from './dto/update-pack.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@ApiTags('Packs')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('packs')
export class PacksController {
  constructor(private readonly packsService: PacksService) { }

  @Post()
  @RequirePermissions('packs.create')
  @ApiOperation({ summary: 'Create a new pack' })
  @ApiResponse({ status: 201, description: 'Pack created successfully.' })
  create(@Body() createPackDto: CreatePackDto) { return this.packsService.create(createPackDto); }

  @Get()
  @ApiOperation({ summary: 'Get all packs' })
  @ApiResponse({ status: 200, description: 'List of packs retrieved successfully.' })
  findAll() { return this.packsService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get pack by ID' })
  @ApiResponse({ status: 200, description: 'Pack retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Pack not found.' })
  findOne(@Param('id') id: string) { return this.packsService.findOne(+id); }

  @Patch(':id')
  @RequirePermissions('packs.update')
  @ApiOperation({ summary: 'Update pack by ID' })
  @ApiResponse({ status: 200, description: 'Pack updated successfully.' })
  @ApiResponse({ status: 404, description: 'Pack not found.' })
  update(@Param('id') id: string, @Body() updatePackDto: UpdatePackDto) { return this.packsService.update(+id, updatePackDto); }

  @Delete(':id')
  @RequirePermissions('packs.delete')
  @ApiOperation({ summary: 'Delete pack by ID' })
  @ApiResponse({ status: 200, description: 'Pack deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Pack not found.' })
  remove(@Param('id') id: string) { return this.packsService.remove(+id); }
}