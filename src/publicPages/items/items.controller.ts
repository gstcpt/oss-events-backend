import { Controller, Get, Param, Req, Post, UseGuards, Body, Query } from '@nestjs/common';
import { PublicPageItemsService } from './items.service';
import { InteractionsService } from '../../common/services/interactions.service';
import { CommentsService } from '../../common/services/comments.service';
import { PageViewService } from '../../common/services/pageview.service';
import { PageEventService } from '../../common/services/pageevent.service';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { User } from '../../common/decorators/user.decorator';
import * as jwt from 'jsonwebtoken';

@ApiTags('Public Page Items')
@Controller('public/items')
export class PublicPageItemsController {
    constructor(private readonly publicPageItemsService: PublicPageItemsService, private readonly interactionsService: InteractionsService, private readonly commentsService: CommentsService, private readonly pageViewService: PageViewService, private readonly pageEventService: PageEventService) { }

    @Get()
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({ summary: 'Get public page items' })
    @ApiResponse({ status: 200, description: 'Public page items retrieved successfully' })
    async getPublicPageItems(@Req() req: any, @Query('userId') userId?: string, @Query('page') page?: string, @Query('limit') limit?: string, @Query('search') search?: string, @Query('categoryIds') categoryIds?: string, @Query('sortBy') sortBy?: string) {
        const origin = req.headers.origin || req.headers.host;
        let finalUserId = userId ? Number(userId) : undefined;
        if (!finalUserId && req.user) { finalUserId = Number(req.user.id); }
        return this.publicPageItemsService.getPublicPageItems(origin, finalUserId, { page: page ? Number(page) : undefined, limit: limit ? Number(limit) : undefined, search, categoryIds, sortBy });
    }

    @Get('filters/tags')
    @ApiOperation({ summary: 'Get category tags filters' })
    @ApiResponse({ status: 200, description: 'Filter tags retrieved successfully' })
    @ApiQuery({ name: 'categoryIds', required: false, type: String })
    async getCategoryFilters(@Req() req: any, @Query('categoryIds') categoryIds?: string) {
        const origin = req.headers.origin || req.headers.host;
        return this.publicPageItemsService.getCategoryFilters(origin, categoryIds);
    }

    @Get(':id')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({ summary: 'Get single item by ID' })
    @ApiResponse({ status: 200, description: 'Item retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Item not found' })
    async getItemById(@Param('id') id: string, @Req() req: any, @Query('userId') userId?: string) {
        const origin = req.headers.origin || req.headers.host;
        let finalUserId = userId ? Number(userId) : undefined;
        if (!finalUserId && req.user) { finalUserId = Number(req.user.id); }
        return await this.publicPageItemsService.getItemById(parseInt(id), origin, finalUserId);
    }

    @Get(':id/similar-items')
    @ApiOperation({ summary: 'Get similar items' })
    @ApiResponse({ status: 200, description: 'Similar items retrieved successfully' })
    getSimilarItems(@Param('id') id: string) { return this.publicPageItemsService.getSimilaireItems(Number(id)); }

    @Get(':id/reactions')
    @ApiOperation({ summary: 'Get item reaction stats' })
    @ApiResponse({ status: 200, description: 'Item reaction stats retrieved successfully' })
    @ApiQuery({ name: 'userId', required: false, type: Number })
    async getReactions(@Param('id') id: string, @Req() req: any, @Query('userId') userId?: number) {
        const stats = await this.interactionsService.getReactionStats('ITEM', Number(id));
        let userReactions: { isLiked: boolean; isDisliked: boolean; userRating: number | null; isFavorite: boolean; } = { isLiked: false, isDisliked: false, userRating: null, isFavorite: false };
        let finalUserId = userId;
        if (!finalUserId) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                try {
                    const token = authHeader.split(' ')[1];
                    const decoded: any = jwt.decode(token);
                    if (decoded && decoded.id) { finalUserId = Number(decoded.id); }
                } catch (e) { }
            }
        }
        if (finalUserId) {
            const userSpecific = await this.interactionsService.getUserReactions(finalUserId, 'ITEM', Number(id));
            userReactions = { ...userReactions, ...userSpecific };
        }
        return { ...stats, userReactions };
    }

    @Post(':id/view')
    @ApiOperation({ summary: 'Track item view' })
    async trackView(@Param('id') id: string, @Req() req: any, @Body() body: { sessionId: number, visitorId: number }) { return this.pageViewService.trackPageView({ sessionId: body.sessionId, visitorId: body.visitorId, userId: req.user?.id ? Number(req.user.id) : undefined, companyId: req.user?.company_id ? BigInt(req.user.company_id) : undefined, resourceType: 'items', resourceId: Number(id), path: `/items/${id}`, title: 'Item View' }); }

    @Post(':id/share')
    @ApiOperation({ summary: 'Track item share' })
    async trackShare(@Param('id') id: string, @Req() req: any, @Body() body: { platform: string }) { return this.pageEventService.trackShare({ resourceType: 'items', resourceId: Number(id), userId: req.user?.id ? Number(req.user.id) : undefined, companyId: req.user?.company_id ? BigInt(req.user.company_id) : undefined, platform: body.platform }); }

    @Post(':id/like')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toggle like on item' })
    async toggleLike(@Param('id') id: string, @User() user: any) { return this.interactionsService.toggleLike(Number(user.id), 'ITEM', Number(id), Number(user.company_id)); }

    @Post(':id/dislike')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toggle dislike on item' })
    async toggleDislike(@Param('id') id: string, @User() user: any) { return this.interactionsService.toggleDislike(Number(user.id), 'ITEM', Number(id), Number(user.company_id)); }

    @Post(':id/favorite')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toggle favorite on item' })
    async toggleFavorite(@Param('id') id: string, @User() user: any) { return this.interactionsService.toggleFavorite(Number(user.id), 'ITEM', Number(id), Number(user.company_id)); }

    @Post(':id/rate')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Rate an item' })
    async rateItem(@Param('id') id: string, @Body() body: { value: number }, @User() user: any) { return this.interactionsService.setRating(Number(user.id), 'ITEM', Number(id), body.value, Number(user.company_id)); }

    @Get(':id/comments')
    @UseGuards(OptionalJwtAuthGuard, PermissionsGuard)
    @ApiOperation({ summary: 'Get item comments' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    getComments(@Param('id') id: string, @Req() req: any, @Query('page') page = 1, @Query('limit') limit = 20) {
        const isRoot = req.user && Number(req.user.role_id) === 1;
        return this.commentsService.getComments({ targetType: 'ITEM', targetId: Number(id), page: Number(page), limit: Number(limit), includeDeleted: isRoot });
    }

    @Post(':id/comments')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a comment' })
    createComment(@Param('id') id: string, @Body() body: { content: string }, @User() user: any) { return this.commentsService.createComment({ userId: Number(user.id), companyId: Number(user.company_id), targetType: 'ITEM', targetId: Number(id), content: body.content }); }

    @Get(':id/interaction-stats')
    @ApiOperation({ summary: 'Get item interaction stats (Legacy)' })
    async getInteractionStatsLegacy(@Param('id') id: string) { return this.getReactions(id, { headers: {} }); }

    @Post(':id/interactions')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create item interaction (Legacy)' })
    async createInteractionLegacy(@Param('id') id: string, @Body() body: { type: string; value: string }, @User() user: any) {
        const targetId = Number(id);
        const userId = Number(user.id);
        const companyId = Number(user.company_id);
        const type = body.type.toUpperCase();
        if (type === 'LIKE') { return this.interactionsService.toggleLike(userId, 'ITEM', targetId, companyId); }
        else if (type === 'DISLIKE') { return this.interactionsService.toggleDislike(userId, 'ITEM', targetId, companyId); }
        else if (type === 'FAVORITE' || type === 'FAVORI') { return this.interactionsService.toggleFavorite(userId, 'ITEM', targetId, companyId); }
        else if (type === 'RATING') { return this.interactionsService.setRating(userId, 'ITEM', targetId, Number(body.value), companyId); }
        else if (type === 'COMMENT') { return this.commentsService.createComment({ userId, companyId, targetType: 'ITEM', targetId, content: body.value }); }
        return { success: false, message: 'Unknown interaction type' };
    }
}