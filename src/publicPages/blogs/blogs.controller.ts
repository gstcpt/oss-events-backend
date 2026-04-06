import { Controller, Get, Post, Put, Delete, Param, Query, Req, BadRequestException, UseGuards, Body } from '@nestjs/common';
import { PublicPageBlogsService } from './blogs.service';
import { InteractionsService } from '../../common/services/interactions.service';
import { CommentsService } from '../../common/services/comments.service';
import { PageViewService } from '../../common/services/pageview.service';
import { PageEventService } from '../../common/services/pageevent.service';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Public Page Blogs')
@Controller('public/blogs')
export class PublicPageBlogsController {
    constructor(private readonly publicPageBlogsService: PublicPageBlogsService, private readonly interactionsService: InteractionsService, private readonly commentsService: CommentsService, private readonly pageViewService: PageViewService, private readonly pageEventService: PageEventService) { }

    @Get()
    @ApiOperation({ summary: 'Get all public blogs' })
    @ApiResponse({ status: 200, description: 'All public blogs retrieved successfully' })
    async getAllBlogs(@Req() req: any) {
        const host = req.headers['x-forwarded-host'] || req.headers.origin || req.headers.host;
        const origin = Array.isArray(host) ? host[0] : host;
        return await this.publicPageBlogsService.getAllBlogs(origin);
    }

    @Get('featured')
    @ApiOperation({ summary: 'Get featured/latest blogs' })
    @ApiResponse({ status: 200, description: 'Featured blogs retrieved successfully' })
    async getFeaturedBlogs(@Req() req: any) {
        const host = req.headers['x-forwarded-host'] || req.headers.origin || req.headers.host;
        const origin = Array.isArray(host) ? host[0] : host;
        const limit = req.query.limit ? parseInt(req.query.limit) : 6;
        return await this.publicPageBlogsService.getFeaturedBlogs(origin, limit);
    }

    @Get('tags')
    @ApiOperation({ summary: 'Get all tags' })
    @ApiResponse({ status: 200, description: 'Tags retrieved successfully' })
    async getBlogTags(@Req() req: any) {
        const host = req.headers['x-forwarded-host'] || req.headers.origin || req.headers.host;
        const origin = Array.isArray(host) ? host[0] : host;
        return await this.publicPageBlogsService.getBlogTags(origin);
    }

    @Get('categories')
    @ApiOperation({ summary: 'Get all categories' })
    @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
    async getBlogCategories(@Req() req: any) {
        const host = req.headers['x-forwarded-host'] || req.headers.origin || req.headers.host;
        const origin = Array.isArray(host) ? host[0] : host;
        return await this.publicPageBlogsService.getBlogCategories(origin);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single blog by ID' })
    @ApiResponse({ status: 200, description: 'Blog retrieved successfully' })
    async getBlogById(@Param('id') id: string, @Req() req: any) {
        const host = req.headers['x-forwarded-host'] || req.headers.origin || req.headers.host;
        const origin = Array.isArray(host) ? host[0] : host;
        const blogId = parseInt(id);
        if (isNaN(blogId)) { throw new BadRequestException('Invalid blog ID'); }
        await this.publicPageBlogsService.incrementBlogView(blogId, origin);
        return await this.publicPageBlogsService.getBlogById(origin, blogId);
    }

    @Get(':id/related')
    @ApiOperation({ summary: 'Get related blogs' })
    @ApiResponse({ status: 200, description: 'Related blogs retrieved successfully' })
    async getRelatedBlogs(@Param('id') id: string, @Req() req: any, @Query('limit') limit?: string) {
        const host = req.headers['x-forwarded-host'] || req.headers.origin || req.headers.host;
        const origin = Array.isArray(host) ? host[0] : host;
        const blogId = parseInt(id);
        const limitNum = limit ? parseInt(limit) : 4;
        if (isNaN(blogId)) { throw new BadRequestException('Invalid blog ID'); }
        return await this.publicPageBlogsService.getRelatedBlogs(origin, blogId, limitNum);
    }

    @Post(':id/view')
    @ApiOperation({ summary: 'Track blog view' })
    async trackView(@Param('id') id: string, @Req() req: any, @Body() body: { sessionId: number, visitorId: number }) { return this.pageViewService.trackPageView({ sessionId: body.sessionId, visitorId: body.visitorId, userId: req.user?.id ? Number(req.user.id) : undefined, companyId: req.user?.company_id ? BigInt(req.user.company_id) : undefined, resourceType: 'blogs', resourceId: Number(id), path: `/blogs/${id}`, title: 'Blog View' }); }

    @Get(':id/reactions')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({ summary: 'Get blog reaction stats' })
    @ApiResponse({ status: 200, description: 'Blog reaction stats retrieved successfully' })
    @ApiQuery({ name: 'userId', required: false, type: Number })
    async getReactions(@Param('id') id: string, @Req() req: any, @Query('userId') userId?: number) {
        const stats = await this.interactionsService.getReactionStats('BLOG', Number(id));
        let userReactions: { isLiked: boolean; isDisliked: boolean; userRating: number | null; isFavorite: boolean; } = { isLiked: false, isDisliked: false, userRating: null, isFavorite: false };
        let finalUserId = userId;
        if (!finalUserId && req.user) { finalUserId = Number(req.user.id); }
        if (finalUserId) {
            const userSpecific = await this.interactionsService.getUserReactions(finalUserId, 'BLOG', Number(id));
            userReactions = { ...userReactions, ...userSpecific };
        }
        return { ...stats, userReactions };
    }

    @Post(':id/like')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toggle like on blog' })
    async toggleLike(@Param('id') id: string, @Req() req: any) { return this.interactionsService.toggleLike(Number(req.user.id), 'BLOG', Number(id), Number(req.user.company_id)); }

    @Post(':id/dislike')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toggle dislike on blog' })
    async toggleDislike(@Param('id') id: string, @Req() req: any) { return this.interactionsService.toggleDislike(Number(req.user.id), 'BLOG', Number(id), Number(req.user.company_id)); }

    @Post(':id/favorite')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toggle favorite on blog' })
    async toggleFavorite(@Param('id') id: string, @Req() req: any) { return this.interactionsService.toggleFavorite(Number(req.user.id), 'BLOG', Number(id), Number(req.user.company_id)); }

    @Post(':id/rate')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Rate a blog' })
    async rateBlog(@Param('id') id: string, @Req() req: any) {
        const { rating, value } = req.body; // Support both payloads
        const finalRating = rating !== undefined ? rating : value;
        if (finalRating === undefined) { throw new BadRequestException('Rating is required'); }
        return this.interactionsService.setRating(Number(req.user.id), 'BLOG', Number(id), finalRating, Number(req.user.company_id));
    }

    @Get(':id/comments')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({ summary: 'Get blog comments' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    getComments(@Param('id') id: string, @Req() req: any, @Query('page') page = 1, @Query('limit') limit = 20) {
        const isRoot = req.user && Number(req.user.role_id) === 1;
        return this.commentsService.getComments({ targetType: 'BLOG', targetId: Number(id), page: Number(page), limit: Number(limit), includeDeleted: isRoot });
    }

    @Post(':id/comment')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add comment to a blog' })
    addBlogComment(@Param('id') id: string, @Req() req: any) {
        const { comment } = req.body;
        return this.commentsService.createComment({ userId: Number(req.user.id), companyId: Number(req.user.company_id), targetType: 'BLOG', targetId: Number(id), content: comment });
    }

    @Post(':id/comments')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add comment to a blog (Unified)' })
    addBlogCommentUnified(@Param('id') id: string, @Req() req: any) {
        const { content, comment } = req.body;
        return this.commentsService.createComment({ userId: Number(req.user.id), companyId: Number(req.user.company_id), targetType: 'BLOG', targetId: Number(id), content: content || comment });
    }

    @Put('comment/:commentId')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Edit a blog comment' })
    editBlogComment(@Param('commentId') commentId: string, @Req() req: any) {
        const { comment } = req.body;
        const isAdmin = Number(req.user.role_id) === 1;
        return this.commentsService.updateComment(Number(commentId), Number(req.user.id), { content: comment }, isAdmin);
    }

    @Delete('comment/:commentId')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a blog comment' })
    deleteBlogComment(@Param('commentId') commentId: string, @Req() req: any) {
        const roleId = Number(req.user.role_id);
        return this.commentsService.deleteComment(Number(commentId), Number(req.user.id), roleId);
    }

    @Get(':id/liked')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Check if user has liked a blog (Legacy)' })
    async checkBlogLike(@Param('id') id: string, @Req() req: any) {
        const reactions = await this.interactionsService.getUserReactions(Number(req.user.id), 'BLOG', Number(id));
        return { liked: reactions.isLiked };
    }

    @Get(':id/user-rating')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Get user's rating for a blog (Legacy)" })
    async getUserRatingForBlog(@Param('id') id: string, @Req() req: any) {
        const reactions = await this.interactionsService.getUserReactions(Number(req.user.id), 'BLOG', Number(id));
        return { rating: reactions.userRating };
    }

    @Get(':id/average-rating')
    @ApiOperation({ summary: 'Get average rating for a blog (Legacy)' })
    async getBlogAverageRating(@Param('id') id: string) {
        const stats = await this.interactionsService.getReactionStats('BLOG', Number(id));
        return { averageRating: stats.avgRating };
    }

    @Post(':id/share')
    @ApiOperation({ summary: 'Increment share count for a blog' })
    async shareBlog(@Param('id') id: string, @Req() req: any, @Body() body: { platform: string }) {
        const host = req.headers['x-forwarded-host'] || req.headers.origin || req.headers.host;
        const origin = Array.isArray(host) ? host[0] : host;
        await this.publicPageBlogsService.incrementBlogShare(Number(id), origin);
        return this.pageEventService.trackShare({ resourceType: 'blogs', resourceId: Number(id), userId: req.user?.id ? Number(req.user.id) : undefined, companyId: req.user?.company_id ? BigInt(req.user.company_id) : undefined, platform: body?.platform });
    }
}