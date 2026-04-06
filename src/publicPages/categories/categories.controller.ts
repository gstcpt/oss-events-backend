import { Controller, Get, Param, Query, Req, Post, UseGuards, Body } from '@nestjs/common';
import { PublicPageCategoriesService } from './categories.service';
import { InteractionsService } from '../../common/services/interactions.service';
import { CommentsService } from '../../common/services/comments.service';
import { PageViewService } from '../../common/services/pageview.service';
import { PageEventService } from '../../common/services/pageevent.service';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Public Page Categories')
@Controller('public/categories')
export class PublicPageCategoriesController {
    constructor(private readonly publicPageCategoriesService: PublicPageCategoriesService, private readonly interactionsService: InteractionsService, private readonly commentsService: CommentsService, private readonly pageViewService: PageViewService, private readonly pageEventService: PageEventService) { }

    @Get()
    @ApiOperation({ summary: 'Get public page categories' })
    @ApiResponse({ status: 200, description: 'Public page categories retrieved successfully' })
    getPublicPageCategories(@Req() req: any) {
        const origin = req.headers.origin || req.headers.host;
        return this.publicPageCategoriesService.getPublicPageCategories(origin);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get category by ID' })
    @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
    getCategoryById(@Param('id') id: string, @Req() req: any) {
        const origin = req.headers.origin || req.headers.host;
        return this.publicPageCategoriesService.getCategoryById(Number(id), origin);
    }

    @Get(':id/items')
    @ApiOperation({ summary: 'Get items for a category' })
    @ApiResponse({ status: 200, description: 'Category items retrieved successfully' })
    getCategoryItems(@Param('id') id: string, @Query('page') page: string = '1', @Query('limit') limit: string = '10', @Query('search') search: string = '', @Query('sortBy') sortBy: string = 'relevance', @Query('tags') tags: string = '', @Req() req: any) {
        const filters = { page: parseInt(page), limit: parseInt(limit), search, sortBy, tags: tags ? tags.split(',').filter(Boolean) : [] };
        const origin = req.headers.origin || req.headers.host;
        return this.publicPageCategoriesService.getCategoryItems(Number(id), filters, origin);
    }

    @Post(':id/view')
    @ApiOperation({ summary: 'Track category view' })
    async trackView(@Param('id') id: string, @Req() req: any, @Body() body: { sessionId: number, visitorId: number }) { return this.pageViewService.trackPageView({ sessionId: body.sessionId, visitorId: body.visitorId, userId: req.user?.id ? Number(req.user.id) : undefined, companyId: req.user?.company_id ? BigInt(req.user.company_id) : undefined, resourceType: 'categories', resourceId: Number(id), path: `/categories/${id}`, title: 'Category View' }); }

    @Post(':id/share')
    @ApiOperation({ summary: 'Track category share' })
    async trackShare(@Param('id') id: string, @Req() req: any, @Body() body: { platform: string }) { return this.pageEventService.trackShare({ resourceType: 'categories', resourceId: Number(id), userId: req.user?.id ? Number(req.user.id) : undefined, companyId: req.user?.company_id ? BigInt(req.user.company_id) : undefined, platform: body.platform }); }

    @Get(':id/reactions')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({ summary: 'Get category reaction stats' })
    @ApiResponse({ status: 200, description: 'Category reaction stats retrieved successfully' })
    @ApiQuery({ name: 'userId', required: false, type: Number })
    async getReactions(@Param('id') id: string, @Req() req: any, @Query('userId') userId?: number) {
        const stats = await this.interactionsService.getReactionStats('CATEGORY', Number(id));
        let userReactions: { isLiked: boolean; isDisliked: boolean; userRating: number | null; isFavorite: boolean; } = { isLiked: false, isDisliked: false, userRating: null, isFavorite: false };
        let finalUserId = userId;
        if (!finalUserId && req.user) { finalUserId = Number(req.user.id); }
        if (finalUserId) {
            const userSpecific = await this.interactionsService.getUserReactions(finalUserId, 'CATEGORY', Number(id));
            userReactions = { ...userReactions, ...userSpecific };
        }
        return { ...stats, userReactions };
    }

    @Post(':id/like')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toggle like on category' })
    async toggleLike(@Param('id') id: string, @Req() req: any) { return this.interactionsService.toggleLike(Number(req.user.id), 'CATEGORY', Number(id), Number(req.user.company_id)); }

    @Post(':id/dislike')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toggle dislike on category' })
    async toggleDislike(@Param('id') id: string, @Req() req: any) { return this.interactionsService.toggleDislike(Number(req.user.id), 'CATEGORY', Number(id), Number(req.user.company_id)); }

    @Post(':id/favorite')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toggle favorite on category' })
    async toggleFavorite(@Param('id') id: string, @Req() req: any) { return this.interactionsService.toggleFavorite(Number(req.user.id), 'CATEGORY', Number(id), Number(req.user.company_id)); }

    @Post(':id/comments')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add comment to a category' })
    createComment(@Param('id') id: string, @Body() body: { content: string }, @Req() req: any) { return this.commentsService.createComment({ userId: Number(req.user.id), companyId: Number(req.user.company_id), targetType: 'CATEGORY', targetId: Number(id), content: body.content }); }

    @Get(':id/comments')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({ summary: 'Get category comments' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    getComments(@Param('id') id: string, @Req() req: any, @Query('page') page = 1, @Query('limit') limit = 20) {
        const isRoot = req.user && Number(req.user.role_id) === 1;
        return this.commentsService.getComments({ targetType: 'CATEGORY', targetId: Number(id), page: Number(page), limit: Number(limit), includeDeleted: isRoot });
    }
}