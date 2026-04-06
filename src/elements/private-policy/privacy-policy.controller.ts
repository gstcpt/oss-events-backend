import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PrivacyPolicyService } from './privacy-policy.service';
import { CreatePrivacyPolicyDto } from './dto/create-privacy-policy.dto';
import { UpdatePrivacyPolicyDto } from './dto/update-privacy-policy.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { User } from '../../common/decorators/user.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Privacy Policy')
@Controller('privacy-policy')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PrivacyPolicyController {
  constructor(private readonly privacyPolicyService: PrivacyPolicyService) { }

  @Post()
  @RequirePermissions('privacy.create')
  @ApiOperation({ summary: 'Create a new Privacy Policy' })
  @ApiResponse({ status: 201, description: 'Privacy Policy created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createPrivacyPolicyDto: CreatePrivacyPolicyDto, @User() currentUser: any) { return await this.privacyPolicyService.createPrivacyPolicy(createPrivacyPolicyDto, currentUser.id); }

  @Get()
  @ApiOperation({ summary: 'Get all Privacy Policies' })
  @ApiResponse({ status: 200, description: 'Privacy Policies retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async findAll(@User() currentUser: any) { return await this.privacyPolicyService.findAllPrivacyPolicies(currentUser.id); }

  @Get(':id')
  @ApiOperation({ summary: 'Get a Privacy Policy by ID' })
  @ApiResponse({ status: 200, description: 'Privacy Policy retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Privacy Policy not found' })
  async findOne(@Param('id') id: string, @User() currentUser: any) { return await this.privacyPolicyService.findOnePrivacyPolicy(+id, currentUser.id); }

  @Patch(':id')
  @RequirePermissions('privacy.update')
  @ApiOperation({ summary: 'Update a Privacy Policy by ID' })
  @ApiResponse({ status: 200, description: 'Privacy Policy updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Privacy Policy not found' })
  async update(@Param('id') id: string, @Body() updatePrivacyPolicyDto: UpdatePrivacyPolicyDto, @User() currentUser: any) { return await this.privacyPolicyService.updatePrivacyPolicy(+id, updatePrivacyPolicyDto, currentUser.id); }

  @Delete(':id')
  @RequirePermissions('privacy.delete')
  @ApiOperation({ summary: 'Delete a Privacy Policy by ID' })
  @ApiResponse({ status: 200, description: 'Privacy Policy deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Privacy Policy not found' })
  async remove(@Param('id') id: string, @User() currentUser: any) { return await this.privacyPolicyService.deletePrivacyPolicy(+id, currentUser.id); }
}