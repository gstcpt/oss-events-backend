import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('Roles')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @Post()
  @RequirePermissions('role.create')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully.' })
  create(@Body() createRoleDto: CreateRoleDto, @User() currentUser: any) { return this.roleService.create(createRoleDto, currentUser); }

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'List of roles retrieved successfully.' })
  findAll() { return this.roleService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Role retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  findOne(@Param('id') id: string) { return this.roleService.findOne(+id); }

  @Patch(':id')
  @RequirePermissions('role.update')
  @ApiOperation({ summary: 'Update role by ID' })
  @ApiResponse({ status: 200, description: 'Role updated successfully.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto, @User() currentUser: any) { return this.roleService.update(+id, updateRoleDto, currentUser); }

  @Delete(':id')
  @RequirePermissions('role.delete')
  @ApiOperation({ summary: 'Delete role by ID' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  remove(@Param('id') id: string, @User() currentUser: any) { return this.roleService.remove(+id, currentUser); }
}