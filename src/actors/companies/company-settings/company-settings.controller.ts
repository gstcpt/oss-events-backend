import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CompanySettingsService } from './company-settings.service';
import { CreateCompanySettingsDto } from './dto/create-company-settings.dto';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@ApiTags('Company settings')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('company-settings')
export class CompanySettingsController {
  constructor(private readonly companySettingsService: CompanySettingsService) { }

  @Post()
  @RequirePermissions('company-settings.create')
  @ApiOperation({ summary: 'Create new company settings' })
  @ApiResponse({ status: 201, description: 'Company settings created successfully.' })
  create(@Body() createCompanySettingsDto: CreateCompanySettingsDto, @Req() req: any) { return this.companySettingsService.create(createCompanySettingsDto, req.user); }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get company settings by company ID' })
  @ApiResponse({ status: 200, description: 'Company settings retrieved successfully.' })
  findByCompanyId(@Param('companyId') companyId: string) { return this.companySettingsService.findByCompanyId(+companyId); }

  @Get()
  @ApiOperation({ summary: 'Get all company settings' })
  @ApiResponse({ status: 200, description: 'List of company settings retrieved successfully.' })
  findAll() { return this.companySettingsService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get company settings by ID' })
  @ApiResponse({ status: 200, description: 'Company settings retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Company settings not found.' })
  findOne(@Param('id') id: string) { return this.companySettingsService.findOne(+id); }

  @Patch(':id')
  @RequirePermissions('company-settings.update')
  @ApiOperation({ summary: 'Update company settings by ID' })
  @ApiResponse({ status: 200, description: 'Company settings updated successfully.' })
  @ApiResponse({ status: 404, description: 'Company settings not found.' })
  update(@Param('id') id: string, @Body() updateCompanySettingsDto: UpdateCompanySettingsDto, @Req() req: any) { return this.companySettingsService.update(+id, updateCompanySettingsDto, req.user); }

  @Delete(':id')
  @RequirePermissions('company-settings.delete')
  @ApiOperation({ summary: 'Delete company settings by ID' })
  @ApiResponse({ status: 200, description: 'Company settings deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Company settings not found.' })
  remove(@Param('id') id: string, @Req() req: any) { return this.companySettingsService.remove(+id, req.user); }
}