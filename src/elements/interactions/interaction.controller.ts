import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InteractionService } from './interaction.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('Interactions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('interactions')
export class InteractionController {
  constructor(private readonly interactionService: InteractionService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new interaction' })
  @ApiResponse({ status: 201, description: 'Interaction created successfully.' })
  create(@Body() createInteractionDto: CreateInteractionDto, @User() user: any) { return this.interactionService.create(createInteractionDto, user); }

  @Get()
  @ApiOperation({ summary: 'Get all interactions' })
  @ApiResponse({ status: 200, description: 'List of interactions retrieved successfully.' })
  findAll(@User() user: any) { return this.interactionService.findAll(user); }

  @Get('history')
  @ApiOperation({ summary: 'Get user interaction history' })
  @ApiResponse({ status: 200, description: 'User interaction history retrieved successfully.' })
  findUserHistory(@User() user: any) { return this.interactionService.findUserHistory(user); }

  @Get(':id')
  @ApiOperation({ summary: 'Get interaction by ID' })
  @ApiResponse({ status: 200, description: 'Interaction retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Interaction not found.' })
  findOne(@Param('id') id: string, @User() user: any) { return this.interactionService.findOne(+id, user); }

  @Get('stats/:itemId')
  @ApiOperation({ summary: 'Get interaction statistics for an item' })
  @ApiResponse({ status: 200, description: 'Interaction stats retrieved successfully.' })
  getStats(@Param('itemId') itemId: string, @User() user: any) { return this.interactionService.getInteractionStats(+itemId, user); }

  @Get('types/all')
  @ApiOperation({ summary: 'Get all interaction types from app_settings' })
  @ApiResponse({ status: 200, description: 'Interaction types retrieved successfully.' })
  getTypes() { return this.interactionService.getAllInteractionTypes(); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update interaction by ID' })
  @ApiResponse({ status: 200, description: 'Interaction updated successfully.' })
  @ApiResponse({ status: 404, description: 'Interaction not found.' })
  update(@Param('id') id: string, @Body() updateInteractionDto: UpdateInteractionDto, @User() user: any) { return this.interactionService.update(+id, updateInteractionDto, user); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete interaction by ID' })
  @ApiResponse({ status: 200, description: 'Interaction deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Interaction not found.' })
  remove(@Param('id') id: string, @User() user: any) { return this.interactionService.remove(+id, user); }
}