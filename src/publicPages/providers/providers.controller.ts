import { Controller, Get, Param, Req, Post, UseGuards, Body, Query } from '@nestjs/common';
import { PublicPageProvidersService } from './providers.service';
import { InteractionsService } from '../../common/services/interactions.service';
import { CommentsService } from '../../common/services/comments.service';
import { PageViewService } from '../../common/services/pageview.service';
import { PageEventService } from '../../common/services/pageevent.service';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Public Page Providers')
@Controller('public/providers')
export class PublicPageProvidersController {
    constructor(private readonly publicPageProvidersService: PublicPageProvidersService, private readonly interactionsService: InteractionsService, private readonly commentsService: CommentsService, private readonly pageViewService: PageViewService, private readonly pageEventService: PageEventService) { }

    @Get()
    @ApiOperation({ summary: 'Get all public providers for tenant' })
    @ApiResponse({ status: 200, description: 'Providers retrieved successfully' })
    async getAllProviders(@Req() req: any) {
        const origin = req.headers.origin || req.headers.host;
        return await this.publicPageProvidersService.getAllProviders(origin);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get single provider by user ID' })
    @ApiResponse({ status: 200, description: 'Provider retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Provider not found' })
    @ApiQuery({ name: 'userId', required: false, type: Number })
    async getProviderById(@Param('id') id: string, @Req() req: any, @Query('userId') userId?: number) {
        const origin = req.headers.origin || req.headers.host;
        return await this.publicPageProvidersService.getProviderById(parseInt(id), origin, userId ? Number(userId) : undefined);
    }

    @Get(':id/reactions')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({ summary: 'Get provider reaction stats' })
    @ApiResponse({ status: 200, description: 'Provider reaction stats retrieved successfully' })
    @ApiQuery({ name: 'userId', required: false, type: Number })
    async getReactions(@Param('id') id: string, @Req() req: any, @Query('userId') userId?: number) {
        const stats = await this.interactionsService.getReactionStats('PROVIDER', Number(id));
        let userReactions: { isLiked: boolean; isDisliked: boolean; userRating: number | null; isFavorite: boolean; } = { isLiked: false, isDisliked: false, userRating: null, isFavorite: false };
        let finalUserId = userId;
        if (!finalUserId && req.user) { finalUserId = Number(req.user.id); }
        if (finalUserId) {
            const userSpecific = await this.interactionsService.getUserReactions(finalUserId, 'PROVIDER', Number(id));
            userReactions = { ...userReactions, ...userSpecific };
        }
        return { ...stats, userReactions };
    }

    @Post(':id/view')
    @ApiOperation({ summary: 'Track provider view' })
    async trackView(@Param('id') id: string, @Req() req: any, @Body() body: { sessionId: number, visitorId: number }) { return this.pageViewService.trackPageView({ sessionId: body.sessionId, visitorId: body.visitorId, userId: req.user?.id ? Number(req.user.id) : undefined, companyId: req.user?.company_id ? BigInt(req.user.company_id) : undefined, resourceType: 'providers', resourceId: Number(id), path: `/providers/${id}`, title: 'Provider View' }); }

    @Post(':id/share')
    @ApiOperation({ summary: 'Track provider share' })
    async trackShare(@Param('id') id: string, @Req() req: any, @Body() body: { platform: string }) { return this.pageEventService.trackShare({ resourceType: 'providers', resourceId: Number(id), userId: req.user?.id ? Number(req.user.id) : undefined, companyId: req.user?.company_id ? BigInt(req.user.company_id) : undefined, platform: body.platform }); }

    @Post(':id/like')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toggle like on provider' })
    async toggleLike(@Param('id') id: string, @Req() req: any) { return this.interactionsService.toggleLike(Number(req.user.id), 'PROVIDER', Number(id), Number(req.user.company_id)); }

    @Post(':id/dislike')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toggle dislike on provider' })
    async toggleDislike(@Param('id') id: string, @Req() req: any) { return this.interactionsService.toggleDislike(Number(req.user.id), 'PROVIDER', Number(id), Number(req.user.company_id)); }

    @Post(':id/favorite')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toggle favorite on provider' })
    async toggleFavorite(@Param('id') id: string, @Req() req: any) { return this.interactionsService.toggleFavorite(Number(req.user.id), 'PROVIDER', Number(id), Number(req.user.company_id)); }

    @Post(':id/rate')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Rate a provider' })
    async rateProvider(@Param('id') id: string, @Body() body: { value: number }, @Req() req: any) { return this.interactionsService.setRating(Number(req.user.id), 'PROVIDER', Number(id), body.value, Number(req.user.company_id)); }

    @Get(':id/comments')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({ summary: 'Get provider reviews/comments' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    getComments(@Param('id') id: string, @Req() req: any, @Query('page') page = 1, @Query('limit') limit = 20) {
        const isRoot = req.user && Number(req.user.role_id) === 1;
        return this.commentsService.getComments({ targetType: 'PROVIDER', targetId: Number(id), page: Number(page), limit: Number(limit), includeDeleted: isRoot });
    }

    @Post(':id/comments')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add review/comment to a provider' })
    createComment(@Param('id') id: string, @Body() body: { content: string }, @Req() req: any) { return this.commentsService.createComment({ userId: Number(req.user.id), companyId: Number(req.user.company_id), targetType: 'PROVIDER', targetId: Number(id), content: body.content }); }
}