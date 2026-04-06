import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RaportService } from './raport.service';
import { User as UserDecorator } from '../../common/decorators/user.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Raports')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('raports')
export class RaportController {
    constructor(private readonly raportService: RaportService) { }

    @Get('companies')
    @ApiOperation({ summary: 'Get all companies based on current user authorization' })
    @ApiResponse({ status: 200, description: 'List of companies retrieved successfully.' })
    getCompanies(@UserDecorator() currentUser: any) { return this.raportService.getCompanies(currentUser); }

    @Get('companies-stats')
    @ApiOperation({ summary: 'Get all companies stats based on current user authorization' })
    @ApiResponse({ status: 200, description: 'List of companies stats retrieved successfully.' })
    getCompaniesStats(@UserDecorator() currentUser: any) { return this.raportService.getCompaniesStats(currentUser); }

    @Get('subscriptions')
    @ApiOperation({ summary: 'Get all subscriptions based on current user authorization' })
    @ApiResponse({ status: 200, description: 'List of subscriptions retrieved successfully.' })
    getSubscriptions(@UserDecorator() currentUser: any) { return this.raportService.getSubscriptions(currentUser); }

    @Get('subscriptions-stats')
    @ApiOperation({ summary: 'Get all subscriptions stats based on current user authorization' })
    @ApiResponse({ status: 200, description: 'List of subscriptions stats retrieved successfully.' })
    getSubscriptionsStats(@UserDecorator() currentUser: any) { return this.raportService.getSubscriptionsStats(currentUser); }

    @Get('users')
    @ApiOperation({ summary: 'Get all users based on current user authorization' })
    @ApiResponse({ status: 200, description: 'List of users retrieved successfully.' })
    getUsers(@UserDecorator() currentUser: any) { return this.raportService.getUsers(currentUser); }

    @Get('users-stats')
    @ApiOperation({ summary: 'Get all users stats based on current user authorization' })
    @ApiResponse({ status: 200, description: 'List of users stats retrieved successfully.' })
    getUsersStats(@UserDecorator() currentUser: any) { return this.raportService.getUsersStats(currentUser); }

    @Get('users-per-role')
    @ApiOperation({ summary: 'Get user counts grouped by role for charting' })
    @ApiResponse({ status: 200, description: 'User counts per role retrieved successfully.' })
    getUsersPerRole(@UserDecorator() currentUser: any) { return this.raportService.getUsersPerRole(currentUser); }

    @Get('users-per-role-and-status')
    @ApiOperation({ summary: 'Get user counts grouped by role and status for charting' })
    @ApiResponse({ status: 200, description: 'User counts per role and status retrieved successfully.' })
    getUsersPerRoleAndStatus(@UserDecorator() currentUser: any) { return this.raportService.getUsersPerRoleAndStatus(currentUser); }

    @Get('admins')
    @ApiOperation({ summary: 'Get all admins based on current user authorization' })
    @ApiResponse({ status: 200, description: 'List of admins retrieved successfully.' })
    getAdmins(@UserDecorator() currentUser: any) { return this.raportService.getAdmins(currentUser); }

    @Get('providers')
    @ApiOperation({ summary: 'Get all providers based on current user authorization' })
    @ApiResponse({ status: 200, description: 'List of providers retrieved successfully.' })
    getProviders(@UserDecorator() currentUser: any) { return this.raportService.getProviders(currentUser); }

    @Get('clients')
    @ApiOperation({ summary: 'Get all clients based on current user authorization' })
    @ApiResponse({ status: 200, description: 'List of clients retrieved successfully.' })
    getClients(@UserDecorator() currentUser: any) { return this.raportService.getClients(currentUser); }

    @Get('tags')
    @ApiOperation({ summary: 'Get all tags based on current user authorization' })
    @ApiResponse({ status: 200, description: 'List of tags retrieved successfully.' })
    getTags(@UserDecorator() currentUser: any) { return this.raportService.getTags(currentUser); }

    @Get('categories')
    @ApiOperation({ summary: 'Get all categories based on current user authorization' })
    @ApiResponse({ status: 200, description: 'List of categories retrieved successfully.' })
    getCategories(@UserDecorator() currentUser: any) { return this.raportService.getCategories(currentUser); }

    @Get('items')
    @ApiOperation({ summary: 'Get all items based on current user authorization' })
    @ApiResponse({ status: 200, description: 'List of items retrieved successfully.' })
    getItems(@UserDecorator() currentUser: any) { return this.raportService.getItems(currentUser); }

    @Get('media')
    @ApiOperation({ summary: 'Get all media based on current user authorization' })
    @ApiResponse({ status: 200, description: 'List of media retrieved successfully.' })
    getMedia(@UserDecorator() currentUser: any) { return this.raportService.getMedia(currentUser); }

    @Get('media-stats')
    @ApiOperation({ summary: 'Get all media stats based on current user authorization' })
    @ApiResponse({ status: 200, description: 'List of media stats retrieved successfully.' })
    getMediaStats(@UserDecorator() currentUser: any) { return this.raportService.getMediaStats(currentUser); }

    @Get('events')
    @ApiOperation({ summary: 'Get all events based on current user authorization' })
    @ApiResponse({ status: 200, description: 'List of events retrieved successfully.' })
    getEvents(@UserDecorator() currentUser: any) { return this.raportService.getEvents(currentUser); }

    @Get('events-stats')
    @ApiOperation({ summary: 'Get all events stats based on current user authorization' })
    @ApiResponse({ status: 200, description: 'List of events stats retrieved successfully.' })
    getEventsStats(@UserDecorator() currentUser: any) { return this.raportService.getEventsStats(currentUser); }

    @Get('events-by-month')
    getEventsByMonth(@UserDecorator() currentUser: any) { return this.raportService.getEventsByMonth(currentUser); }

    @Get('events-per-category')
    getEventsPerCategory(@UserDecorator() currentUser: any) { return this.raportService.getEventsPerCategory(currentUser); }
}