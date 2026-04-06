import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) { }

  @Post()
  @RequirePermissions('subscriptions.create')
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully.' })
  create(@Body() createSubscriptionDto: CreateSubscriptionDto, @User() currentUser: any) { return this.subscriptionService.create(createSubscriptionDto, currentUser); }

  @Get('list')
  @ApiOperation({ summary: 'Get subscriptions list with user context' })
  @ApiResponse({ status: 200, description: 'List of subscriptions retrieved successfully.' })
  list(@Body() body: { currentUser: any }) { return this.subscriptionService.findAll(body.currentUser); }

  @Get()
  @ApiOperation({ summary: 'Get all subscriptions' })
  @ApiResponse({ status: 200, description: 'List of subscriptions retrieved successfully.' })
  findAll(@User() currentUser: any) { return this.subscriptionService.findAll(currentUser); }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiResponse({ status: 200, description: 'Subscription retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Subscription not found.' })
  findOne(@Param('id') id: string, @User() currentUser: any) { return this.subscriptionService.findOne(+id, currentUser); }

  @Patch(':id')
  @RequirePermissions('subscriptions.update')
  @ApiOperation({ summary: 'Update subscription by ID' })
  @ApiResponse({ status: 200, description: 'Subscription updated successfully.' })
  @ApiResponse({ status: 404, description: 'Subscription not found.' })
  update(@Param('id') id: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto, @User() currentUser: any) { return this.subscriptionService.update(+id, updateSubscriptionDto, currentUser); }

  @Delete(':id')
  @RequirePermissions('subscriptions.delete')
  @ApiOperation({ summary: 'Delete subscription by ID' })
  @ApiResponse({ status: 200, description: 'Subscription deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Subscription not found.' })
  remove(@Param('id') id: string, @User() currentUser: any) { return this.subscriptionService.remove(+id, currentUser); }
}