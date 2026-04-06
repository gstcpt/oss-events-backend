import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('Events')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) { }

  @Post()
  @RequirePermissions('events.create')
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event created successfully.' })
  create(@Body() createEventDto: CreateEventDto, @User() user: any) { return this.eventService.create(createEventDto, user); }

  @Post('complex')
  @RequirePermissions('events.complex.create')
  @ApiOperation({ summary: 'Create complex event with items and occupations' })
  @ApiResponse({ status: 201, description: 'Complex event created successfully.' })
  createComplexEvent(
    @Body() body: {
      companyId: number;
      clientId: number;
      eventStartDate: string;
      eventEndDate: string;
      title: string;
      category: string;
      guests: number;
      description: string;
      itemsWithDates: Array<{
        itemId: number;
        itemStartDate: string;
        itemEndDate: string;
        priceHt: number;
        tvaValue: number;
        discount: number;
      }>;
    },
    @User() user: any
  ) {
    return this.eventService.createComplexEvent(
      body.companyId,
      body.clientId,
      new Date(body.eventStartDate),
      new Date(body.eventEndDate),
      body.itemsWithDates.map(item => ({ ...item, itemStartDate: new Date(item.itemStartDate), itemEndDate: new Date(item.itemEndDate) })),
      body.title,
      body.category,
      body.guests,
      body.description,
      user
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all events' })
  @ApiResponse({ status: 200, description: 'List of events retrieved successfully.' })
  findAll(@User() user: any) { return this.eventService.findAll(user); }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiResponse({ status: 200, description: 'Event retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  findOne(@Param('id') id: string, @User() user: any) { return this.eventService.findOne(+id, user); }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get event statistics' })
  @ApiResponse({ status: 200, description: 'Event statistics retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  getEventStatistics(@Param('id') id: string, @User() user: any) { return this.eventService.getEventStatistics(+id, user); }

  @Patch(':id')
  @RequirePermissions('events.update', { checkOwnership: true, resourceEntity: 'events', ownerField: 'client_id' })
  @ApiOperation({ summary: 'Update event by ID' })
  @ApiResponse({ status: 200, description: 'Event updated successfully.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto, @User() user: any) { return this.eventService.update(+id, updateEventDto, user); }

  @Patch('complex/:id')
  @RequirePermissions('events.complex.update')
  @ApiOperation({ summary: 'Update complex event with items and occupations' })
  @ApiResponse({ status: 200, description: 'Complex event updated successfully.' })
  updateComplexEvent(
    @Param('id') id: string,
    @Body() body: {
      companyId: number;
      clientId: number;
      eventStartDate: string;
      eventEndDate: string;
      title: string;
      category: string;
      guests: number;
      description: string;
      itemsWithDates: Array<{
        id?: number;
        itemId: number;
        itemStartDate: string;
        itemEndDate: string;
        priceHt: number;
        tvaValue: number;
        discount: number;
      }>;
    },
    @User() user: any
  ) {
    return this.eventService.updateComplexEvent(
      +id,
      body.companyId,
      body.clientId,
      new Date(body.eventStartDate),
      new Date(body.eventEndDate),
      body.itemsWithDates.map(item => ({ ...item, itemStartDate: new Date(item.itemStartDate), itemEndDate: new Date(item.itemEndDate) })),
      body.title,
      body.category,
      body.guests,
      body.description,
      user
    );
  }

  @Delete(':id')
  @RequirePermissions('events.delete', { checkOwnership: true, resourceEntity: 'events', ownerField: 'client_id' })
  @ApiOperation({ summary: 'Delete event by ID' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  remove(@Param('id') id: string, @User() user: any) { return this.eventService.remove(+id, user); }
}