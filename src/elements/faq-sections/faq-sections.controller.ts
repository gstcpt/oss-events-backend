import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FaqSectionsService } from './faq-sections.service';
import { CreateFaqSectionDto } from './dto/create-faq-section.dto';
import { UpdateFaqSectionDto } from './dto/update-faq-section.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { User } from '../../common/decorators/user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Faq Sections')
@Controller('faq-sections')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class FaqSectionsController {
  constructor(private readonly faqSectionsService: FaqSectionsService) { }

  @Post()
  @ApiOperation({ summary: 'Create FAQ Section' })
  @ApiResponse({ status: 201, description: 'The FAQ Section has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createFaqSectionDto: CreateFaqSectionDto, @User() user: any) { return this.faqSectionsService.create(createFaqSectionDto, user.id); }

  @Get()
  @ApiOperation({ summary: 'Get all FAQ Sections' })
  @ApiResponse({ status: 200, description: 'Return all FAQ Sections.' })
  findAll(@User() user: any) { return this.faqSectionsService.findAll(user.id); }

  @Get(':id')
  @ApiOperation({ summary: 'Get an FAQ Section by id' })
  @ApiResponse({ status: 200, description: 'Return the FAQ Section.' })
  @ApiResponse({ status: 404, description: 'FAQ Section not found.' })
  findOne(@Param('id') id: string, @User() user: any) { return this.faqSectionsService.findOne(+id, user.id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an FAQ Section' })
  @ApiResponse({ status: 200, description: 'The FAQ Section has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'FAQ Section not found.' })
  update(@Param('id') id: string, @Body() updateFaqSectionDto: UpdateFaqSectionDto, @User() user: any) { return this.faqSectionsService.update(+id, updateFaqSectionDto, user.id); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an FAQ Section' })
  @ApiResponse({ status: 200, description: 'The FAQ Section has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'FAQ Section not found.' })
  remove(@Param('id') id: string, @User() user: any) { return this.faqSectionsService.remove(+id, user.id); }
}