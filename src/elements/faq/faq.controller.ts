import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FAQService } from './faq.service';
import { CreateFAQDto } from './dto/create-faq.dto';
import { UpdateFAQDto } from './dto/update-faq.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { User } from '../../common/decorators/user.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('FAQ')
@Controller('faq')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class FAQController {
  constructor(private readonly faqService: FAQService) { }

  @Post()
  @RequirePermissions('faq.createFAQ')
  @ApiOperation({ summary: 'Create a new FAQ' })
  @ApiResponse({ status: 201, description: 'FAQ created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createFAQDto: CreateFAQDto, @User() currentUser: any) { return await this.faqService.createFAQ(createFAQDto, currentUser.id); }

  @Get()
  @ApiOperation({ summary: 'Get all FAQs' })
  @ApiResponse({ status: 200, description: 'FAQs retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async findAll(@User() currentUser: any) { return await this.faqService.findAllFAQs(currentUser.id); }

  @Get(':id')
  @ApiOperation({ summary: 'Get a FAQ by ID' })
  @ApiResponse({ status: 200, description: 'FAQ retrieved successfully' })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  async findOne(@Param('id') id: string, @User() currentUser: any) { return await this.faqService.findOneFAQ(+id, currentUser.id); }

  @Patch(':id')
  @RequirePermissions('faq.updateFAQ')
  @ApiOperation({ summary: 'Update a FAQ by ID' })
  @ApiResponse({ status: 200, description: 'FAQ updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  async update(@Param('id') id: string, @Body() updateFAQDto: UpdateFAQDto, @User() currentUser: any) { return await this.faqService.updateFAQ(+id, updateFAQDto, currentUser.id); }

  @Delete(':id')
  @RequirePermissions('faq.deleteFAQ')
  @ApiOperation({ summary: 'Delete a FAQ by ID' })
  @ApiResponse({ status: 200, description: 'FAQ deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  async remove(@Param('id') id: string, @User() currentUser: any) { return await this.faqService.deleteFAQ(+id, currentUser.id); }
}