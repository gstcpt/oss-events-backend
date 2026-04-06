import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('Tags')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) { }

  @Post()
  @RequirePermissions('tag.create')
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({ status: 201, description: 'Tag created successfully.' })
  create(@Body() createTagDto: CreateTagDto, @Req() req: any) { return this.tagService.create(createTagDto, req.user); }

  @Get('list/:currentUserId')
  @ApiOperation({ summary: 'Get tags list with user context' })
  @ApiResponse({ status: 200, description: 'List of tags retrieved successfully.' })
  list(@Param('currentUserId') currentUserId: number) { return this.tagService.findAll(currentUserId); }

  @Get(':id')
  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiResponse({ status: 200, description: 'Tag retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Tag not found.' })
  findOne(@Param('id') id: string) { return this.tagService.findOne(+id); }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get tags by category ID' })
  @ApiResponse({ status: 200, description: 'List of tags retrieved successfully.' })
  findByCategory(@Param('categoryId') categoryId: string, @User() currentUser: any) { return this.tagService.findByCategory(+categoryId, currentUser); }

  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({ status: 200, description: 'List of tags retrieved successfully.' })
  findAll(@User() currentUser: any) { return this.tagService.findAll(currentUser); }

  @Patch(':id')
  @RequirePermissions('tag.update')
  @ApiOperation({ summary: 'Update tag by ID' })
  @ApiResponse({ status: 200, description: 'Tag updated successfully.' })
  @ApiResponse({ status: 404, description: 'Tag not found.' })
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto, @User() currentUser: any) { return this.tagService.update(+id, updateTagDto, currentUser); }

  @Delete(':id')
  @RequirePermissions('tag.delete')
  @ApiOperation({ summary: 'Delete tag by ID' })
  @ApiResponse({ status: 200, description: 'Tag deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Tag not found.' })
  remove(@Param('id') id: string, @User() currentUser: any) { return this.tagService.remove(+id, currentUser); }
}