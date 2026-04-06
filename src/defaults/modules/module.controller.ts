import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('Modules')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('modules')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) { }

  @Post()
  @RequirePermissions('modules.create')
  @ApiOperation({ summary: 'Create a new module' })
  @ApiResponse({ status: 201, description: 'Module created successfully.' })
  create(@Body() createModuleDto: CreateModuleDto, @User() currentUser: any) { return this.moduleService.create(createModuleDto, currentUser); }

  @Get()
  @ApiOperation({ summary: 'Get all modules' })
  @ApiResponse({ status: 200, description: 'List of modules retrieved successfully.' })
  findAll() { return this.moduleService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get module by ID' })
  @ApiResponse({ status: 200, description: 'Module retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Module not found.' })
  findOne(@Param('id') id: string) { return this.moduleService.findOne(+id); }

  @Patch(':id')
  @RequirePermissions('modules.update')
  @ApiOperation({ summary: 'Update module by ID' })
  @ApiResponse({ status: 200, description: 'Module updated successfully.' })
  @ApiResponse({ status: 404, description: 'Module not found.' })
  update(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto, @User() currentUser: any) { return this.moduleService.update(+id, updateModuleDto, currentUser); }

  @Delete(':id')
  @RequirePermissions('modules.delete')
  @ApiOperation({ summary: 'Delete module by ID' })
  @ApiResponse({ status: 200, description: 'Module deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Module not found.' })
  remove(@Param('id') id: string, @User() currentUser: any) { return this.moduleService.remove(+id, currentUser); }
}