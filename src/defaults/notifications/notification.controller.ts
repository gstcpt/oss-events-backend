import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: 201, description: 'Notification created successfully.' })
  create(@Body() createNotificationDto: CreateNotificationDto) { return this.notificationService.create(createNotificationDto); }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get notifications for a user with pagination' })
  @ApiResponse({ status: 200, description: 'List of notifications retrieved successfully.' })
  findAllNotificationByUser(@Param('userId') userId: string, @Query('page') page: string, @Query('limit') limit: string,) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 15;
    return this.notificationService.findAllNotificationByUser(+userId, pageNumber, limitNumber);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications with pagination' })
  @ApiResponse({ status: 200, description: 'List of notifications retrieved successfully.' })
  findAll(@Query('page') page: string, @Query('limit') limit: string) { return this.notificationService.findAll(); }

  @Get('user/:userId/count-all')
  @ApiOperation({ summary: 'Get count of all notifications for a user' })
  @ApiResponse({ status: 200, description: 'Count of all notifications retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  countAllByUser(@Param('userId') userId: string) { return this.notificationService.countAllByUser(+userId); }

  @Get('user/:userId/last-5')
  @ApiOperation({ summary: 'Get last 5 notifications for a user' })
  @ApiResponse({ status: 200, description: 'List of notifications retrieved successfully.' })
  findLast5NotificationByUser(@Param('userId') userId: string) { return this.notificationService.findLast5NotificationByUser(+userId); }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read successfully.' })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  markNotificationAsReadById(@Param('id') id: string) { return this.notificationService.markNotificationAsReadById(+id); }

  @Patch(':id/unread')
  @ApiOperation({ summary: 'Mark notification as unread' })
  @ApiResponse({ status: 200, description: 'Notification marked as unread successfully.' })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  markNotificationAsUnreadById(@Param('id') id: string) { return this.notificationService.markNotificationAsUnreadById(+id); }

  @Patch('user/:userId/read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for a user' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  markAllNotificationAsReadById(@Param('userId') userId: string) { return this.notificationService.markAllNotificationAsReadById(+userId); }

  @Get('user/:userId/unread-count')
  @ApiOperation({ summary: 'Get count of unread notifications for a user' })
  @ApiResponse({ status: 200, description: 'Count of unread notifications retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  countUnreadNotificationsByUser(@Param('userId') userId: string) { return this.notificationService.countUnreadNotificationsByUser(+userId); }
}