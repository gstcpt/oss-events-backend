import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppSettingsService } from './app-settings.service';
import { CreateAppSettingsDto } from './dto/create-app-settings.dto';
import { UpdateAppSettingsDto } from './dto/update-app-settings.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@ApiTags('App settings')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('app-settings')
export class AppSettingsController {
  constructor(private readonly appSettingsService: AppSettingsService) { }

  @Post()
  @RequirePermissions('app.settings.create')
  @ApiOperation({ summary: 'Create new app settings' })
  @ApiResponse({ status: 201, description: 'App settings created successfully.' })
  create(@Body() createAppSettingsDto: CreateAppSettingsDto) { return this.appSettingsService.create(createAppSettingsDto); }

  @Get()
  @ApiOperation({ summary: 'Get all app settings' })
  @ApiResponse({ status: 200, description: 'List of app settings retrieved successfully.' })
  findAll() { return this.appSettingsService.findAll(); }

  @Get('famille/:famille')
  @ApiOperation({ summary: 'Get app settings by famille' })
  @ApiResponse({ status: 200, description: 'App settings by famille retrieved successfully.' })
  findByFamille(@Param('famille') famille: string) { return this.appSettingsService.findByFamille(famille); }

  @Get(':id')
  @ApiOperation({ summary: 'Get app settings by ID' })
  @ApiResponse({ status: 200, description: 'App settings retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'App settings not found.' })
  findOne(@Param('id') id: string) { return this.appSettingsService.findOne(+id); }

  @Patch(':id')
  @RequirePermissions('app.settings.update')
  @ApiOperation({ summary: 'Update app settings by ID' })
  @ApiResponse({ status: 200, description: 'App settings updated successfully.' })
  @ApiResponse({ status: 404, description: 'App settings not found.' })
  update(@Param('id') id: string, @Body() updateAppSettingsDto: UpdateAppSettingsDto) { return this.appSettingsService.update(+id, updateAppSettingsDto); }

  @Delete(':id')
  @RequirePermissions('app.settings.delete')
  @ApiOperation({ summary: 'Delete app settings by ID' })
  @ApiResponse({ status: 200, description: 'App settings deleted successfully.' })
  @ApiResponse({ status: 404, description: 'App settings not found.' })
  remove(@Param('id') id: string) { return this.appSettingsService.remove(+id); }
}