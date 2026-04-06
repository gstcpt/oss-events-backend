import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@ApiTags('Permissions')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) { }

  @Post()
  @RequirePermissions('permission.create')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully.' })
  create(@Body() createPermissionDto: CreatePermissionDto) { return this.permissionService.create(createPermissionDto); }

  @Get()
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, description: 'List of permissions retrieved successfully.' })
  findAll() { return this.permissionService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiResponse({ status: 200, description: 'Permission retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  findOne(@Param('id') id: string) { return this.permissionService.findOne(+id); }

  @Patch(':id')
  @RequirePermissions('permission.update')
  @ApiOperation({ summary: 'Update permission by ID' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully.' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) { return this.permissionService.update(+id, updatePermissionDto); }

  @Delete(':id')
  @RequirePermissions('permission.delete')
  @ApiOperation({ summary: 'Delete permission by ID' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  remove(@Param('id') id: string) { return this.permissionService.remove(+id); }
}