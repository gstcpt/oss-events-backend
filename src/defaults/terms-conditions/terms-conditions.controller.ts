import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TermsConditionsService } from './terms-conditions.service';
import { CreateTermsConditionsDto } from './dto/create-terms-conditions.dto';
import { UpdateTermsConditionsDto } from './dto/update-terms-conditions.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Terms Conditions')
@Controller('terms-conditions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class TermsConditionsController {
  constructor(private readonly termsConditionsService: TermsConditionsService) { }

  @Post()
  @RequirePermissions('terms.conditions.create')
  @ApiOperation({ summary: 'Create Terms & Conditions' })
  @ApiResponse({ status: 201, description: 'Terms & Conditions created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createTermsConditionsDto: CreateTermsConditionsDto, @User() currentUser: any) { return await this.termsConditionsService.createTermsConditions(createTermsConditionsDto, currentUser.id); }

  @Get()
  @ApiOperation({ summary: 'Get all Terms & Conditions for company' })
  @ApiResponse({ status: 200, description: 'Terms & Conditions retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async findAll(@User() currentUser: any) { return await this.termsConditionsService.findTermsConditionsByCompany(currentUser.id); }

  @Get(':id')
  @ApiOperation({ summary: 'Get Terms & Conditions by ID' })
  @ApiResponse({ status: 200, description: 'Terms & Conditions retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Terms & Conditions not found' })
  async findOne(@Param('id') id: string, @User() currentUser: any) { return await this.termsConditionsService.findOneTermsConditions(+id, currentUser.id); }

  @Patch(':id')
  @RequirePermissions('terms.conditions.update')
  @ApiOperation({ summary: 'Update Terms & Conditions by ID' })
  @ApiResponse({ status: 200, description: 'Terms & Conditions updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Terms & Conditions not found' })
  async update(@Param('id') id: string, @Body() updateTermsConditionsDto: UpdateTermsConditionsDto, @User() currentUser: any) { return await this.termsConditionsService.updateTermsConditions(+id, updateTermsConditionsDto, currentUser.id); }

  @Delete(':id')
  @RequirePermissions('terms.conditions.delete')
  @ApiOperation({ summary: 'Delete Terms & Conditions by ID' })
  @ApiResponse({ status: 200, description: 'Terms & Conditions deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Terms & Conditions not found' })
  async remove(@Param('id') id: string, @User() currentUser: any) { return await this.termsConditionsService.deleteTermsConditions(+id, currentUser.id); }
}