import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolePermissionService } from './role-permission.service';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Role permission')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('role-permission')
export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new role permission' })
  @ApiResponse({ status: 201, description: 'Role permission created successfully.' })
  create(@Body() createRolePermissionDto: CreateRolePermissionDto) { return this.rolePermissionService.create(createRolePermissionDto); }

  @Get()
  @ApiOperation({ summary: 'Get all role permissions' })
  @ApiResponse({ status: 200, description: 'List of role permissions retrieved successfully.' })
  findAll() { return this.rolePermissionService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get role permission by ID' })
  @ApiResponse({ status: 200, description: 'Role permission retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Role permission not found.' })
  findOne(@Param('id') id: string) { return this.rolePermissionService.findOne(+id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update role permission by ID' })
  @ApiResponse({ status: 200, description: 'Role permission updated successfully.' })
  @ApiResponse({ status: 404, description: 'Role permission not found.' })
  update(@Param('id') id: string, @Body() updateRolePermissionDto: UpdateRolePermissionDto) { return this.rolePermissionService.update(+id, updateRolePermissionDto); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role permission by ID' })
  @ApiResponse({ status: 200, description: 'Role permission deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Role permission not found.' })
  remove(@Param('id') id: string) { return this.rolePermissionService.remove(+id); }
}