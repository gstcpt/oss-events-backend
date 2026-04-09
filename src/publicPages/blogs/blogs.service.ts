import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../common/services/tenant.service';

@Injectable()
export class PublicPageBlogsService {
    constructor(private prisma: PrismaService, private tenantService: TenantService) { }
    /**
     * Get all public blogs for a company
     * @param origin - The origin URL from request headers
     * @returns Array of blog posts with related data
     */
    async getAllBlogs(origin: string) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            const blogs = await this.prisma.client.blogs.findMany({
                where: { company_id: company.id, status: 1 },
                include: { users: { select: { id: true, firstname: true, lastname: true, avatar: true } }, blog_media: true, blogTags: true, blogCategories: true },
                orderBy: { date: 'desc' }
            });
            // Fetch aggregates for interactions
            const blogIds = blogs.map(b => b.id);
            const ratings = await this.prisma.client.new_interactions.findMany({ where: { target_id: { in: blogIds }, target_type: 'BLOG', type: 'RATING' }, select: { target_id: true, value: true } });
            const comments = await this.prisma.client.comments.groupBy({ by: ['target_id'], where: { target_id: { in: blogIds }, target_type: 'BLOG', is_deleted: false }, _count: { id: true } });
            const likes = await this.prisma.client.new_interactions.groupBy({ by: ['target_id'], where: { target_id: { in: blogIds }, target_type: 'BLOG', type: 'LIKE' }, _count: { id: true } });
            const blogsWithStats = blogs.map(blog => {
                const blogId = blog.id;
                const blogRatings = ratings.filter(r => r.target_id === blogId);
                const avgRating = blogRatings.length > 0 ? blogRatings.reduce((sum, r) => sum + (parseFloat(r.value || '0') || 0), 0) / blogRatings.length : 0;
                const commentStat = comments.find(c => c.target_id === blogId);
                const likeStat = likes.find(l => l.target_id === blogId);
                return {
                    id: Number(blog.id),
                    title: blog.title,
                    content: blog.content,
                    image: blog.image,
                    date: blog.date ? blog.date.toISOString().split('T')[0] : null,
                    user_id: Number(blog.user_id),
                    author: blog.users ? { id: Number(blog.users.id), name: `${blog.users.firstname || ''} ${blog.users.lastname || ''}`.trim(), avatar: blog.users.avatar } : null,
                    views: blog.views || 0,
                    shares: blog.shares || 0,
                    rating: Math.round(avgRating * 10) / 10,
                    reviewCount: blogRatings.length,
                    commentCount: commentStat?._count.id || 0,
                    likeCount: likeStat?._count.id || 0,
                    company_id: Number(blog.company_id),
                    status: blog.status,
                    created_at: blog.date ? blog.date.toISOString() : new Date().toISOString(),
                    updated_at: blog.date ? blog.date.toISOString() : new Date().toISOString(),
                    tags: blog.blogTags.map(tag => tag.tag_title),
                    categories: blog.blogCategories.map(cat => cat.category_title)
                };
            });
            return blogsWithStats;
        } catch (error) { throw new BadRequestException('Failed to fetch blogs: ' + error.message); }
    }
    /**
     * Get a single blog by ID
     * @param origin - The origin URL from request headers
     * @param blogId - The blog ID
     * @returns Blog post with related data
     */
    async getBlogById(origin: string, blogId: number) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            const blog = await this.prisma.client.blogs.findFirst({ where: { id: BigInt(blogId), company_id: company.id, status: 1 }, include: { users: { select: { id: true, firstname: true, lastname: true, avatar: true } }, blog_media: true, blogTags: true, blogCategories: true } });
            if (!blog) { throw new BadRequestException('Blog not found'); }
            const [interactions, comments, views] = await Promise.all([
                this.prisma.client.new_interactions.findMany({ where: { target_id: BigInt(blogId), target_type: 'BLOG' } }),
                this.prisma.client.comments.findMany({ where: { target_id: BigInt(blogId), target_type: 'BLOG', is_deleted: false }, include: { users: { select: { id: true, firstname: true, lastname: true, avatar: true } } }, orderBy: { created_at: 'desc' } }),
                this.prisma.client.page_view.count({ where: { resourceType: 'blogs', resourceId: blogId } })
            ]);
            let totalRating = 0;
            let ratingCount = 0;
            let likeCount = 0;

            interactions.forEach(i => {
                if (i.type === 'RATING' && i.value) {
                    totalRating += parseFloat(i.value);
                    ratingCount++;
                } else if (i.type === 'LIKE') { likeCount++; }
            });
            const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
            const formattedComments = comments.map(comment => ({
                id: Number(comment.id),
                comment: comment.content,
                created_at: comment.created_at.toISOString(),
                user: comment.users ? { id: Number(comment.users.id), name: `${comment.users.firstname || ''} ${comment.users.lastname || ''}`.trim(), avatar: comment.users.avatar } : null
            }));
            return {
                id: Number(blog.id),
                title: blog.title,
                content: blog.content,
                image: blog.image,
                date: blog.date ? blog.date.toISOString().split('T')[0] : null,
                user_id: Number(blog.user_id),
                author: blog.users ? { id: Number(blog.users.id), name: `${blog.users.firstname || ''} ${blog.users.lastname || ''}`.trim(), avatar: blog.users.avatar } : null,
                views: views,
                shares: blog.shares || 0,
                rating: Math.round(averageRating * 10) / 10,
                reviewCount: ratingCount,
                commentCount: comments.length,
                likes: likeCount,
                comments: formattedComments,
                media: blog.blog_media.map(media => ({ id: Number(media.id), file: media.file, media_type: media.media_type })),
                company_id: Number(blog.company_id),
                status: blog.status,
                created_at: blog.date ? blog.date.toISOString() : new Date().toISOString(),
                updated_at: blog.date ? blog.date.toISOString() : new Date().toISOString(),
                tags: blog.blogTags.map(tag => tag.tag_title),
                categories: blog.blogCategories.map(cat => cat.category_title)
            };
        } catch (error) { throw new BadRequestException('Failed to fetch blog: ' + error.message); }
    }
    async incrementBlogView(blogId: number, origin: string) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            const blog = await this.prisma.client.blogs.findFirst({ where: { id: BigInt(blogId), company_id: company.id, status: 1 } });
            if (blog) { await this.prisma.client.blogs.update({ where: { id: BigInt(blogId) }, data: { views: { increment: 1 } } }); }
        } catch (error) { }
    }
    async incrementBlogShare(blogId: number, origin: string) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            const blog = await this.prisma.client.blogs.findFirst({ where: { id: BigInt(blogId), company_id: company.id, status: 1 } });
            if (blog) {
                const updatedBlog = await this.prisma.client.blogs.update({ where: { id: BigInt(blogId) }, data: { shares: { increment: 1 } } });
                return { shares: updatedBlog.shares };
            }
        } catch (error) { throw new BadRequestException('Failed to increment share count: ' + error.message); }
    }
    /**
     * Get featured/latest blogs
     * @param origin - The origin URL from request headers
     * @param limit - Number of blogs to return (default: 6)
     * @returns Array of featured blogs
     */
    async getFeaturedBlogs(origin: string, limit: number = 6) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            const blogs = await this.prisma.client.blogs.findMany({ where: { company_id: company.id, status: 1 }, include: { users: { select: { id: true, firstname: true, lastname: true, avatar: true } }, blogTags: true, blogCategories: true }, orderBy: { date: 'desc' }, take: limit });
            // Fetch aggregates for interactions
            const blogIds = blogs.map(b => b.id);
            const ratings = await this.prisma.client.new_interactions.findMany({ where: { target_id: { in: blogIds }, target_type: 'BLOG', type: 'RATING' }, select: { target_id: true, value: true } });
            const blogsWithRatings = blogs.map(blog => {
                const blogRatings = ratings.filter(r => r.target_id === blog.id);
                const avgRating = blogRatings.length > 0 ? blogRatings.reduce((sum, r) => sum + (parseFloat(r.value || '0') || 0), 0) / blogRatings.length : 0;
                return {
                    id: Number(blog.id),
                    title: blog.title,
                    content: blog.content.substring(0, 200) + '...',
                    image: blog.image,
                    date: blog.date ? blog.date.toISOString().split('T')[0] : null,
                    author: blog.users ? { name: `${blog.users.firstname || ''} ${blog.users.lastname || ''}`.trim() } : null,
                    rating: Math.round(avgRating * 10) / 10,
                    reviewCount: blogRatings.length,
                    views: blog.views || 0,
                    tags: blog.blogTags.map(tag => tag.tag_title),
                    categories: blog.blogCategories.map(cat => cat.category_title)
                };
            });
            return blogsWithRatings;
        } catch (error) { throw new BadRequestException('Failed to fetch featured blogs: ' + error.message); }
    }
    /**
     * Like or unlike a blog post
     * @param origin - The origin URL from request headers
     * @param blogId - The blog ID
     * @param userId - The user ID (from auth)
     * @returns Updated blog with new like count
     */
    async toggleBlogLike(origin: string, blogId: number, userId: number) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            const blog = await this.prisma.client.blogs.findFirst({ where: { id: BigInt(blogId), company_id: company.id, status: 1 } });
            if (!blog) { throw new BadRequestException('Blog not found'); }
            const existingLike = await this.prisma.client.new_interactions.findFirst({ where: { target_id: BigInt(blogId), target_type: 'BLOG', user_id: BigInt(userId), type: 'LIKE' } });
            if (existingLike) {
                await this.prisma.client.new_interactions.delete({ where: { id: existingLike.id } });
                return { liked: false, message: 'Blog unliked successfully' };
            } else {
                await this.prisma.client.new_interactions.create({ data: { target_id: BigInt(blogId), target_type: 'BLOG', user_id: BigInt(userId), company_id: blog.company_id, type: 'LIKE' } });
                return { liked: true, message: 'Blog liked successfully' };
            }
        } catch (error) { throw new BadRequestException('Failed to toggle blog like: ' + error.message); }
    }
    /**
     * Check if user has liked a blog
     * @param blogId - The blog ID
     * @param userId - The user ID
     * @returns Boolean indicating if user liked the blog
     */
    async hasUserLikedBlog(blogId: number, userId: number) {
        try {
            const like = await this.prisma.client.new_interactions.findFirst({ where: { target_id: BigInt(blogId), target_type: 'BLOG', user_id: BigInt(userId), type: 'LIKE' } });
            return !!like;
        } catch (error) { return false; }
    }
    /**
     * Add comment to a blog
     * @param origin - The origin URL from request headers
     * @param blogId - The blog ID
     * @param userId - The user ID (from auth)
     * @param comment - The comment content
     * @returns Created comment
     */
    async addBlogComment(origin: string, blogId: number, userId: number, comment: string) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            const blog = await this.prisma.client.blogs.findFirst({ where: { id: BigInt(blogId), company_id: company.id, status: 1 } });
            if (!blog) { throw new BadRequestException('Blog not found'); }
            const createdComment = await this.prisma.client.comments.create({ data: { target_id: BigInt(blogId), target_type: 'BLOG', user_id: BigInt(userId), company_id: blog.company_id, content: comment }, include: { users: { select: { id: true, firstname: true, lastname: true, avatar: true } } } });
            return {
                id: Number(createdComment.id),
                comment: createdComment.content,
                created_at: createdComment.created_at.toISOString(),
                user: createdComment.users ? { id: Number(createdComment.users.id), name: `${createdComment.users.firstname || ''} ${createdComment.users.lastname || ''}`.trim(), avatar: createdComment.users.avatar } : null
            };
        } catch (error) { throw new BadRequestException('Failed to add comment: ' + error.message); }
    }
    async editBlogComment(origin: string, commentId: number, userId: number, comment: string) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            const existingComment = await this.prisma.client.comments.findFirst({ where: { id: BigInt(commentId) } });
            if (!existingComment) { throw new BadRequestException('Comment not found'); }
            if (Number(existingComment.user_id) !== Number(userId)) { throw new BadRequestException('You can only edit your own comments'); }
            if (!existingComment.company_id || BigInt(existingComment.company_id) !== BigInt(company.id)) { throw new BadRequestException('Comment not found'); }
            const updatedComment = await this.prisma.client.comments.update({ where: { id: BigInt(commentId) }, data: { content: comment }, include: { users: { select: { id: true, firstname: true, lastname: true, avatar: true } } } });
            return { id: Number(updatedComment.id), comment: updatedComment.content, created_at: updatedComment.created_at.toISOString(), user: updatedComment.users ? { id: Number(updatedComment.users.id), name: `${updatedComment.users.firstname || ''} ${updatedComment.users.lastname || ''}`.trim(), avatar: updatedComment.users.avatar } : null };
        } catch (error) { throw new BadRequestException('Failed to edit comment: ' + error.message); }
    }
    async deleteBlogComment(origin: string, commentId: number, userId: number) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            const existingComment = await this.prisma.client.comments.findFirst({ where: { id: BigInt(commentId) } });
            if (!existingComment) { throw new BadRequestException('Comment not found'); }
            if (Number(existingComment.user_id) !== Number(userId)) { throw new BadRequestException('You can only delete your own comments'); }
            if (!existingComment.company_id || BigInt(existingComment.company_id) !== BigInt(company.id)) { throw new BadRequestException('Comment not found'); }
            await this.prisma.client.comments.update({ where: { id: BigInt(commentId) }, data: { is_deleted: true } });
            return { success: true, message: 'Comment deleted successfully' };
        } catch (error) { throw new BadRequestException('Failed to delete comment: ' + error.message); }
    }
    async rateBlog(origin: string, blogId: number, userId: number, rating: number) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            const blog = await this.prisma.client.blogs.findFirst({ where: { id: BigInt(blogId), company_id: company.id, status: 1 } });
            if (!blog) { throw new BadRequestException('Blog not found'); }
            if (rating < 1 || rating > 5) { throw new BadRequestException('Rating must be between 1 and 5'); }
            const existingRating = await this.prisma.client.new_interactions.findFirst({ where: { target_id: BigInt(blogId), target_type: 'BLOG', user_id: BigInt(userId), type: 'RATING' } });
            if (existingRating) { await this.prisma.client.new_interactions.update({ where: { id: existingRating.id }, data: { value: String(rating) } }); }
            else { await this.prisma.client.new_interactions.create({ data: { target_id: BigInt(blogId), target_type: 'BLOG', user_id: BigInt(userId), company_id: blog.company_id, type: 'RATING', value: String(rating) } }); }
            const ratings = await this.prisma.client.new_interactions.findMany({ where: { target_id: BigInt(blogId), target_type: 'BLOG', type: 'RATING' } });
            const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + (parseFloat(r.value || '0') || 0), 0) / ratings.length : 0;
            return { success: true, message: 'Blog rated successfully', newRating: averageRating };
        } catch (error) { throw new BadRequestException('Failed to rate blog: ' + error.message); }
    }
    async getBlogComments(origin: string, blogId: number) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            const blog = await this.prisma.client.blogs.findFirst({ where: { id: BigInt(blogId), company_id: company.id, status: 1 } });
            if (!blog) { throw new BadRequestException('Blog not found'); }
            const comments = await this.prisma.client.comments.findMany({ where: { target_id: BigInt(blogId), target_type: 'BLOG', is_deleted: false }, include: { users: { select: { id: true, firstname: true, lastname: true, avatar: true } } }, orderBy: { created_at: 'desc' } });
            return comments.map(comment => ({
                id: Number(comment.id),
                comment: comment.content,
                created_at: comment.created_at.toISOString(),
                user: comment.users ? { id: Number(comment.users.id), name: `${comment.users.firstname || ''} ${comment.users.lastname || ''}`.trim(), avatar: comment.users.avatar } : null
            }));
        } catch (error) { throw new BadRequestException('Failed to fetch comments: ' + error.message); }
    }
    async getBlogAverageRating(origin: string, blogId: number) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            const blog = await this.prisma.client.blogs.findFirst({ where: { id: BigInt(blogId), company_id: company.id, status: 1 } });
            if (!blog) { throw new BadRequestException('Blog not found'); }
            const ratings = await this.prisma.client.new_interactions.findMany({ where: { target_id: BigInt(blogId), target_type: 'BLOG', type: 'RATING' } });
            if (ratings.length === 0) { return { averageRating: 0, reviewCount: 0 }; }
            const averageRating = ratings.reduce((sum, r) => sum + (parseFloat(r.value || '0') || 0), 0) / ratings.length;
            return { averageRating: Math.round(averageRating * 10) / 10, reviewCount: ratings.length };
        } catch (error) { throw new BadRequestException('Failed to fetch average rating: ' + error.message); }
    }
    async getUserRatingForBlog(origin: string, blogId: number, userId: number) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            const blog = await this.prisma.client.blogs.findFirst({ where: { id: BigInt(blogId), company_id: company.id, status: 1 } });
            if (!blog) { throw new BadRequestException('Blog not found'); }
            const userRating = await this.prisma.client.new_interactions.findFirst({
                where: { target_id: BigInt(blogId), target_type: 'BLOG', user_id: BigInt(userId), type: 'RATING' }
            });
            return { rating: userRating ? parseFloat(userRating.value || '0') : null };
        } catch (error) { throw new BadRequestException('Failed to fetch user rating: ' + error.message); }
    }
    async getBlogTags(origin: string) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            const tags = await this.prisma.client.blog_tags.findMany({ where: { blogs: { company_id: company.id } }, distinct: ['tag_title'] });
            return tags.map(tag => tag.tag_title);
        } catch (error) { throw new BadRequestException('Failed to fetch blog tags: ' + error.message); }
    }
    async getBlogCategories(origin: string) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            const categories = await this.prisma.client.blog_categories.findMany({ where: { blogs: { company_id: company.id } }, distinct: ['category_title'] });
            return categories.map(cat => cat.category_title);
        } catch (error) { throw new BadRequestException('Failed to fetch blog categories: ' + error.message); }
    }
    async getRelatedBlogs(origin: string, blogId: number, limit: number = 4) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            const currentBlog = await this.prisma.client.blogs.findFirst({ where: { id: BigInt(blogId), company_id: company.id, status: 1 }, include: { blogTags: true, blogCategories: true } });
            if (!currentBlog) { return []; }
            const relatedBlogs = await this.prisma.client.blogs.findMany({
                where: {
                    company_id: company.id,
                    status: 1,
                    id: { not: BigInt(blogId) },
                    OR: [{ blogCategories: { some: { category_title: { in: currentBlog.blogCategories.map(c => c.category_title) } } } }, { blogTags: { some: { tag_title: { in: currentBlog.blogTags.map(t => t.tag_title) } } } }]
                },
                include: { users: { select: { id: true, firstname: true, lastname: true, avatar: true } }, blogTags: true, blogCategories: true },
                orderBy: [{ date: 'desc' }, { views: 'desc' }],
                take: limit
            });
            // Fetch aggregates for interactions
            const blogIds = relatedBlogs.map(b => b.id);
            const ratings = await this.prisma.client.new_interactions.findMany({ where: { target_id: { in: blogIds }, target_type: 'BLOG', type: 'RATING' }, select: { target_id: true, value: true } });
            const blogsWithRatings = await Promise.all(relatedBlogs.map(async (blog) => {
                const blogRatings = ratings.filter(r => r.target_id === blog.id);
                const avgRating = blogRatings.length > 0 ? blogRatings.reduce((sum, r) => sum + (parseFloat(r.value || '0') || 0), 0) / blogRatings.length : 0;
                const actualViews = await this.prisma.client.page_view.count({ where: { resourceType: 'blogs', resourceId: Number(blog.id) } });
                return {
                    id: Number(blog.id),
                    title: blog.title,
                    content: blog.content.substring(0, 150) + '...',
                    image: blog.image,
                    date: blog.date ? blog.date.toISOString().split('T')[0] : null,
                    author: blog.users ? { name: `${blog.users.firstname || ''} ${blog.users.lastname || ''}`.trim() } : null,
                    rating: Math.round(avgRating * 10) / 10,
                    reviewCount: blogRatings.length,
                    views: actualViews,
                    shares: blog.shares || 0,
                    tags: blog.blogTags.map(tag => tag.tag_title),
                    categories: blog.blogCategories.map(cat => cat.category_title)
                };
            }));
            return blogsWithRatings;
        } catch (error) { return []; }
    }
}