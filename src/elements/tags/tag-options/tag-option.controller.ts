import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TagOptionService } from './tag-option.service';
import { CreateTagOptionDto } from './dto/create-tag-option.dto';
import { UpdateTagOptionDto } from './dto/update-tag-option.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';

@ApiTags('Tag options')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tag-options')
export class TagOptionController {
  constructor(private readonly tagOptionService: TagOptionService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new tag option' })
  @ApiResponse({ status: 201, description: 'Tag option created successfully.' })
  create(@Body() createTagOptionDto: CreateTagOptionDto) { return this.tagOptionService.create(createTagOptionDto); }

  @Get()
  @ApiOperation({ summary: 'Get all tag options' })
  @ApiResponse({ status: 200, description: 'List of tag options retrieved successfully.' })
  findAll() { return this.tagOptionService.findAll(); }

  @Get('tag/:tagId')
  @ApiOperation({ summary: 'Get tag options by tag ID' })
  @ApiResponse({ status: 200, description: 'Tag options retrieved successfully.' })
  findByTagId(@Param('tagId') tagId: string) { return this.tagOptionService.findByTagId(+tagId); }

  @Get(':id')
  @ApiOperation({ summary: 'Get tag option by ID' })
  @ApiResponse({ status: 200, description: 'Tag option retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Tag option not found.' })
  findOne(@Param('id') id: string) { return this.tagOptionService.findOne(+id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tag option by ID' })
  @ApiResponse({ status: 200, description: 'Tag option updated successfully.' })
  @ApiResponse({ status: 404, description: 'Tag option not found.' })
  update(@Param('id') id: string, @Body() updateTagOptionDto: UpdateTagOptionDto) { return this.tagOptionService.update(+id, updateTagOptionDto); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete tag option by ID' })
  @ApiResponse({ status: 200, description: 'Tag option deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Tag option not found.' })
  remove(@Param('id') id: string) { return this.tagOptionService.remove(+id); }
}