import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EventLineService } from './event-line.service';
import { CreateEventLineDto } from './dto/create-event-line.dto';
import { UpdateEventLineDto } from './dto/update-event-line.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { User } from '../../../common/decorators/user.decorator';

@ApiTags('Event lines')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('event-lines')
export class EventLineController {
  constructor(private readonly eventLineService: EventLineService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new event line' })
  @ApiResponse({ status: 201, description: 'Event line created successfully.' })
  create(@Body() createEventLineDto: CreateEventLineDto, @User() user: any) { return this.eventLineService.create(createEventLineDto, user); }

  @Get()
  @ApiOperation({ summary: 'Get all event lines' })
  @ApiResponse({ status: 200, description: 'List of event lines retrieved successfully.' })
  findAll(@User() user: any) { return this.eventLineService.findAll(user); }

  @Get(':id')
  @ApiOperation({ summary: 'Get event line by ID' })
  @ApiResponse({ status: 200, description: 'Event line retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Event line not found.' })
  findOne(@Param('id') id: string, @User() user: any) { return this.eventLineService.findOne(+id, user); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update event line by ID' })
  @ApiResponse({ status: 200, description: 'Event line updated successfully.' })
  @ApiResponse({ status: 404, description: 'Event line not found.' })
  update(@Param('id') id: string, @Body() updateEventLineDto: UpdateEventLineDto, @User() user: any) { return this.eventLineService.update(+id, updateEventLineDto, user); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete event line by ID' })
  @ApiResponse({ status: 200, description: 'Event line deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Event line not found.' })
  remove(@Param('id') id: string, @User() user: any) { return this.eventLineService.remove(+id, user); }
}