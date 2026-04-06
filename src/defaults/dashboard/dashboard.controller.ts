import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { DashboardService } from './dashboard.service';
import { User as UserDecorator } from '../../common/decorators/user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get()
    @ApiOperation({ summary: 'Get all dashboard data' })
    @ApiResponse({ status: 200, description: 'Return all dashboard data for the user role.' })
    getDashboard(@UserDecorator() currentUser: any) { return this.dashboardService.getDashboard(currentUser); }

    @Get('top-items')
    @ApiOperation({ summary: 'Get top items' })
    @ApiResponse({ status: 200, description: 'Return top items.' })
    getTopItems(@UserDecorator() currentUser: any) { return this.dashboardService.getTopItems(currentUser); }

    @Get('top-categories')
    @ApiOperation({ summary: 'Get top categories' })
    @ApiResponse({ status: 200, description: 'Return top categories.' })
    getTopCategories(@UserDecorator() currentUser: any) { return this.dashboardService.getTopCategories(currentUser); }

    @Get('top-tags')
    @ApiOperation({ summary: 'Get top tags' })
    @ApiResponse({ status: 200, description: 'Return top tags.' })
    getTopTags(@UserDecorator() currentUser: any) { return this.dashboardService.getTopTags(currentUser); }

    @Get('revenues')
    @ApiOperation({ summary: 'Get revenues' })
    @ApiResponse({ status: 200, description: 'Return revenues.' })
    getRevenues(@UserDecorator() currentUser: any) { return this.dashboardService.getRevenues(currentUser); }

    @Get('last-items')
    @ApiOperation({ summary: 'Get last items' })
    @ApiResponse({ status: 200, description: 'Return last items.' })
    getLastItems(@UserDecorator() currentUser: any) { return this.dashboardService.getLastItems(currentUser); }

    @Get('last-providers')
    @ApiOperation({ summary: 'Get last providers' })
    @ApiResponse({ status: 200, description: 'Return last providers.' })
    getLastProviders(@UserDecorator() currentUser: any) { return this.dashboardService.getLastProviders(currentUser); }

    @Get('last-clients')
    @ApiOperation({ summary: 'Get last clients' })
    @ApiResponse({ status: 200, description: 'Return last clients.' })
    getLastClients(@UserDecorator() currentUser: any) { return this.dashboardService.getLastClients(currentUser); }

    @Get('last-events')
    @ApiOperation({ summary: 'Get last events' })
    @ApiResponse({ status: 200, description: 'Return last events.' })
    getLastEvents(@UserDecorator() currentUser: any) { return this.dashboardService.getLastEvents(currentUser); }

    @Get('stats')
    @ApiOperation({ summary: 'Get dashboard stats' })
    @ApiResponse({ status: 200, description: 'Return dashboard stats.' })
    getStats(@UserDecorator() currentUser: any) { return this.dashboardService.getStats(currentUser); }

    @Get('upcoming-events')
    @ApiOperation({ summary: 'Get upcoming events' })
    @ApiResponse({ status: 200, description: 'Return upcoming events.' })
    getUpcomingEvents(@UserDecorator() currentUser: any) { return this.dashboardService.getUpcomingEvents(currentUser); }

    @Get('recent-events')
    @ApiOperation({ summary: 'Get recent events' })
    @ApiResponse({ status: 200, description: 'Return recent events.' })
    getRecentEvents(@UserDecorator() currentUser: any) { return this.dashboardService.getRecentEvents(currentUser); }

    @Get('events-per-month')
    @ApiOperation({ summary: 'Get events per month' })
    @ApiResponse({ status: 200, description: 'Return events per month.' })
    getEventsPerMonth(@UserDecorator() currentUser: any) { return this.dashboardService.getEventsPerMonth(currentUser); }

    @Get('event-types')
    @ApiOperation({ summary: 'Get event types' })
    @ApiResponse({ status: 200, description: 'Return event types.' })
    getEventTypes(@UserDecorator() currentUser: any) { return this.dashboardService.getEventTypes(currentUser); }

    @Get('revenue-per-month')
    @ApiOperation({ summary: 'Get revenue per month' })
    @ApiResponse({ status: 200, description: 'Return revenue per month.' })
    getRevenuePerMonth(@UserDecorator() currentUser: any) { return this.dashboardService.getRevenuePerMonth(currentUser); }

    @Get('company-address')
    @ApiOperation({ summary: 'Get company address for weather widget' })
    @ApiResponse({ status: 200, description: 'Return company address.' })
    getCompanyAddress(@UserDecorator() currentUser: any) { return this.dashboardService.getCompanyAddress(currentUser); }
}