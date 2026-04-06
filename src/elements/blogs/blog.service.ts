import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBlogDto, CreateBlogCommentDto, CreateBlogRatingDto, CreateBlogTagDto, CreateBlogCategoryDto, CreateBlogLikeDto, CreateBlogMediaDto } from './dto/create-blog.dto';
import { UpdateBlogDto, UpdateBlogCommentDto, UpdateBlogRatingDto, UpdateBlogTagDto, UpdateBlogCategoryDto, UpdateBlogLikeDto, UpdateBlogMediaDto } from './dto/update-blog.dto';
import { LogService } from '../../common/services/log.service';
import { UploadService } from '../../upload/upload.service';

@Injectable()
export class BlogService {
    constructor(private prisma: PrismaService, private logService: LogService, private uploadService: UploadService) { }
    async createBlog(createBlogDto: CreateBlogDto, currentUser: number, files?: Express.Multer.File[]) {
        try {
            const author = await this.prisma.client.users.findUnique({ where: { id: currentUser } });
            if (!author) { throw new BadRequestException('User not found'); }
            const { tags, categories, ...blogData } = createBlogDto;
            let company_id_to_use: bigint | null = author.company_id;
            if (author.role_id?.toString() === '1') { company_id_to_use = createBlogDto.company_id ? BigInt(createBlogDto.company_id) : author.company_id; } else if (author.role_id?.toString() === '2') { company_id_to_use = author.company_id; }
            const blog = await this.prisma.client.blogs.create({
                data: {
                    ...blogData,
                    date: blogData.date ? new Date(blogData.date) : new Date(),
                    user_id: author.id,
                    company_id: company_id_to_use,
                    blogTags: tags ? { create: tags.map(tagId => ({ tag_title: String(tagId) })) } : undefined,
                    blogCategories: categories ? { create: categories.map(catId => ({ category_title: String(catId) })) } : undefined,
                },
                include: { blog_media: true, blogTags: true, blogCategories: true }
            });
            if (files && files.length > 0) {
                const mediaPromises = files.map(async (file) => {
                    const uploadedFile = this.uploadService.uploadBlogImage(file);
                    return this.create({ file: uploadedFile.url, media_type: file.mimetype, blog_id: Number(blog.id), company_id: company_id_to_use ? Number(company_id_to_use) : undefined });
                });
                await Promise.all(mediaPromises);
            }
            await this.logService.createLogForUserAction(Number(author.id), 'blogs', Number(blog.id), 'create', `Blog created: ${blog.id}`);
            return this.getBlogDetails(Number(blog.id), currentUser);
        } catch (error) { throw new BadRequestException(`Error creating blog: ${error.message}`); }
    }
    async getBlogs(currentUser: number) {
        try {
            const user = await this.prisma.client.users.findUnique({ where: { id: currentUser } });
            if (!user) { throw new BadRequestException('User not found'); }

            let blogs;
            if (user.company_id === null) { blogs = await this.prisma.client.blogs.findMany({ include: { blog_media: true, blogTags: true, blogCategories: true, users: true, companies: true }, orderBy: { id: 'desc' } }); }
            else {
                blogs = await this.prisma.client.blogs.findMany({
                    where: { OR: [{ company_id: user.company_id }, { user_id: user.id }] },
                    include: { blog_media: true, blogTags: true, blogCategories: true, users: true, companies: true },
                    orderBy: { id: 'desc' }
                });
            }
            return blogs.map(blog => this.convertBigIntToNumber(blog));
        } catch (error) { throw new BadRequestException('Error getting blogs: ' + error.message); }
    }
    async getBlogDetails(id: number, currentUser: number) {
        try {
            const user = await this.prisma.client.users.findUnique({ where: { id: currentUser } });
            if (!user) { throw new BadRequestException('User not found'); }
            const blog = await this.prisma.client.blogs.findUnique({ where: { id: Number(id) }, include: { blog_media: true, blogTags: true, blogCategories: true, users: true, companies: true } });
            if (!blog) { throw new BadRequestException('Blog not found'); }
            const interactions = await this.prisma.client.new_interactions.findMany({ where: { target_id: Number(id), target_type: 'BLOG' } });
            const isRoot = user.role_id?.toString() === '1';
            const commentsWhereClause: any = { target_id: Number(id), target_type: 'BLOG' };
            if (!isRoot) { commentsWhereClause.is_deleted = false; }
            const comments = await this.prisma.client.comments.findMany({ where: commentsWhereClause, include: { users: true } });
            const viewsCount = await this.prisma.client.page_view.count({ where: { path: `/blogs/${id}` } });
            const stats = { likes: 0, dislikes: 0, favorites: 0, ratings: { total: 0, count: 0, average: 0 }, comments: comments.length, views: viewsCount };
            let userRating = 0;
            for (const interaction of interactions) {
                switch (interaction.type) {
                    case 'LIKE':
                        stats.likes++;
                        break;
                    case 'DISLIKE':
                        stats.dislikes++;
                        break;
                    case 'FAVORITE':
                        stats.favorites++;
                        break;
                    case 'RATING':
                        if (interaction.value) {
                            stats.ratings.total += parseInt(interaction.value, 10);
                            stats.ratings.count++;
                            if (interaction.user_id.toString() === currentUser.toString()) { userRating = parseInt(interaction.value, 10); }
                        }
                        break;
                }
            }
            if (stats.ratings.count > 0) { stats.ratings.average = stats.ratings.total / stats.ratings.count; }
            const formattedComments = comments.map(c => this.formatComment(c));
            const blogWithStats = { ...blog, stats, comments: formattedComments, user_rating: userRating };
            return this.convertBigIntToNumber(blogWithStats);
        } catch (error) { throw new BadRequestException('Error getting blog details: ' + error.message); }
    }

    async updateBlog(id: number, updateBlogDto: UpdateBlogDto, currentUser: number, files?: Express.Multer.File[]) {
        try {
            const user = await this.prisma.client.users.findUnique({ where: { id: currentUser } });
            if (!user) { throw new BadRequestException('User not found'); }
            const { tags, categories, ...restUpdateData } = updateBlogDto;
            const updateData: any = { ...restUpdateData };
            if (updateData.date && !isNaN(new Date(updateData.date).getTime())) { updateData.date = new Date(updateData.date); } else if (updateData.date) { delete updateData.date; }
            if (user.role_id?.toString() === '2' && user.company_id) { updateData.company_id = user.company_id; }
            if (tags) { updateData.blogTags = { deleteMany: {}, create: tags.map(tag => ({ tag_title: String(tag) })) }; }
            if (categories) { updateData.blogCategories = { deleteMany: {}, create: categories.map(cat => ({ category_title: String(cat) })) }; }
            const result = await this.prisma.client.blogs.update({ where: { id }, data: updateData }) as any;
            if (files && files.length > 0) {
                await this.removeMediaByBlogId(Number(id));
                const mediaPromises = files.map(async (file) => {
                    const uploadedFile = this.uploadService.uploadBlogImage(file);
                    const mediaDto: CreateBlogMediaDto = { file: uploadedFile.url, media_type: file.mimetype, blog_id: Number(id), company_id: user.company_id ? Number(user.company_id) : undefined };
                    return this.create(mediaDto);
                });
                await Promise.all(mediaPromises);
                const updatedBlog = await this.prisma.client.blogs.findUnique({ where: { id }, include: { blog_media: true } });
                (result as any).blog_media = updatedBlog?.blog_media || [];
            }
            await this.logService.createLogForUserAction(Number(user.id), 'blogs', id, 'update', 'Blog updated:' + id);
            return result;
        } catch (error) { throw new BadRequestException('Error updating blog: ' + error.message); }
    }
    async deleteBlog(id: number, currentUser: number) {
        try {
            const user = await this.prisma.client.users.findUnique({ where: { id: currentUser } });
            if (!user) { throw new BadRequestException('User not found'); }
            const existingBlog = await this.prisma.client.blogs.findUnique({ where: { id } });
            if (user.role_id?.toString() === '2' && user.company_id) { if (existingBlog?.company_id?.toString() !== user.company_id?.toString()) { throw new BadRequestException('You are not authorized to delete this blog'); } }
            const result = await this.prisma.client.blogs.delete({ where: { id } });
            await this.logService.createLogForUserAction(Number(user.id), 'blogs', id, 'delete', 'Blog deleted:' + id);
            return result;
        } catch (error) { throw new BadRequestException('Error deleting blog: ' + error.message); }
    }
    async createBlogComment(createBlogCommentDto: CreateBlogCommentDto, currentUser: number) {
        try {
            const user = await this.prisma.client.users.findUnique({ where: { id: currentUser } });
            if (!user) { throw new BadRequestException('User not found'); }
            const blog = await this.prisma.client.blogs.findUnique({ where: { id: createBlogCommentDto.blog_id } });
            if (!blog) { throw new BadRequestException('Blog not found'); }

            const comment = await this.prisma.client.comments.create({
                data: { user_id: BigInt(currentUser), company_id: blog.company_id, target_type: 'BLOG', target_id: BigInt(createBlogCommentDto.blog_id), content: createBlogCommentDto.comment }
            });

            await this.logService.createLogForUserAction(Number(user.id), 'comments', Number(comment.id), 'create', 'Blog comment created:' + comment.id);
            return comment;
        } catch (error) { throw new BadRequestException('Error creating blog comment: ' + error.message); }
    }
    async getBlogComments(blogId: number) {
        try {
            const blog = await this.prisma.client.blogs.findUnique({ where: { id: blogId } });
            if (!blog) { throw new BadRequestException('Blog not found'); }
            const comments = await this.prisma.client.comments.findMany({
                where: { target_id: BigInt(blogId), target_type: 'BLOG', is_deleted: false },
                include: { users: true }
            });
            return comments.map(c => this.formatComment(c));
        } catch (error) { throw new BadRequestException('Error getting blog comments: ' + error.message); }
    }
    async createBlogRating(createBlogRatingDto: CreateBlogRatingDto, currentUser: number) {
        try {
            const user = await this.prisma.client.users.findUnique({ where: { id: currentUser } });
            if (!user) { throw new BadRequestException('User not found'); }
            const blog = await this.prisma.client.blogs.findUnique({ where: { id: createBlogRatingDto.blog_id } });
            if (!blog) { throw new BadRequestException('Blog not found'); }
            const existingInteraction = await this.prisma.client.new_interactions.findFirst({ where: { user_id: BigInt(currentUser), target_id: BigInt(createBlogRatingDto.blog_id), target_type: 'BLOG', type: 'RATING' } });
            if (existingInteraction) {
                const updatedInteraction = await this.prisma.client.new_interactions.update({ where: { id: existingInteraction.id }, data: { value: String(createBlogRatingDto.rating) } });
                await this.logService.createLogForUserAction(Number(user.id), 'new_interactions', Number(updatedInteraction.id), 'update', 'Blog rating updated:' + updatedInteraction.id);
                return updatedInteraction;
            } else {
                const newInteraction = await this.prisma.client.new_interactions.create({
                    data: { user_id: BigInt(currentUser), company_id: blog.company_id, target_type: 'BLOG', target_id: BigInt(createBlogRatingDto.blog_id), type: 'RATING', value: String(createBlogRatingDto.rating) }
                });
                await this.logService.createLogForUserAction(Number(user.id), 'new_interactions', Number(newInteraction.id), 'create', 'Blog rating created:' + newInteraction.id);
                return newInteraction;
            }
        } catch (error) { throw new BadRequestException('Error creating/updating blog rating: ' + error.message); }
    }
    async getBlogRating(blogId: number, currentUser: number) {
        try {
            const user = await this.prisma.client.users.findUnique({ where: { id: currentUser } });
            if (!user) { throw new BadRequestException('User not found'); }
            const blog = await this.prisma.client.blogs.findUnique({ where: { id: blogId } });
            if (!blog) { throw new BadRequestException('Blog not found'); }
            if (blog.company_id && user.company_id?.toString() !== blog.company_id?.toString() && blog.user_id?.toString() !== user.id.toString()) { throw new BadRequestException('You do not have permission to rate this blog'); }
            return await this.prisma.client.new_interactions.findFirst({ where: { target_id: BigInt(blogId), target_type: 'BLOG', user_id: user.id, type: 'RATING' } });
        } catch (error) { throw new BadRequestException('Error getting blog rating: ' + error.message); }
    }
    async getBlogAverageRating(blogId: number) {
        try {
            const ratings = await this.prisma.client.new_interactions.findMany({ where: { target_id: BigInt(blogId), target_type: 'BLOG', type: 'RATING' } });
            if (ratings.length === 0) { return 0; }
            const sum = ratings.reduce((acc, r) => acc + (parseFloat(r.value || '0') || 0), 0);
            return sum / ratings.length;
        } catch (error) { throw new BadRequestException('Error getting average blog rating: ' + error.message); }
    }
    private convertBigIntToNumber(obj: any): any {
        if (obj === null || obj === undefined) { return obj; }
        if (typeof obj === 'bigint') { return Number(obj); }
        if (obj instanceof Date) { return obj; }
        if (Array.isArray(obj)) { return obj.map(item => this.convertBigIntToNumber(item)); }
        if (typeof obj === 'object') {
            const result: any = {};
            for (const key in obj) { result[key] = this.convertBigIntToNumber(obj[key]); }
            return result;
        }
        return obj;
    }

    private formatComment(comment: any) {
        return {
            id: Number(comment.id),
            userId: Number(comment.user_id),
            targetType: comment.target_type,
            targetId: Number(comment.target_id),
            content: comment.content,
            isEdited: comment.is_edited,
            editedAt: comment.edited_at,
            isDeleted: comment.is_deleted,
            deletedAt: comment.deleted_at,
            createdAt: comment.created_at,
            updatedAt: comment.updated_at,
            user: comment.users ? {
                id: Number(comment.users.id),
                name: `${comment.users.firstname || ''} ${comment.users.lastname || ''}`.trim(),
                firstname: comment.users.firstname,
                lastname: comment.users.lastname,
                avatar: comment.users.avatar
            } : null
        };
    }
    async create(createBlogMediaDto: CreateBlogMediaDto) {
        try {
            const blogMedia = await this.prisma.client.blog_media.create({
                data: { ...createBlogMediaDto, blog_id: Number(createBlogMediaDto.blog_id), company_id: createBlogMediaDto.company_id ? Number(createBlogMediaDto.company_id) : undefined }
            });
            return { message: 'Blog media created successfully', blogMedia };
        } catch (error) { throw new BadRequestException('Error creating blog media: ' + error.message); }
    }
    async findAll() {
        try {
            const media = await this.prisma.client.blog_media.findMany({ include: { blogs: true } });
            return media.map(item => this.convertBigIntToNumber(item));
        } catch (error) { throw new BadRequestException('Error finding blog media: ' + error.message); }
    }
    async findMediaByBlogId(blogId: number) {
        try {
            const media = await this.prisma.client.blog_media.findMany({ where: { blog_id: blogId }, include: { blogs: true } });
            return media.map(item => this.convertBigIntToNumber(item));
        } catch (error) { throw new BadRequestException('Error finding blog media: ' + error.message); }
    }
    async findOne(id: number) {
        try {
            const media = await this.prisma.client.blog_media.findUnique({ where: { id }, include: { blogs: true } });
            return this.convertBigIntToNumber(media);
        } catch (error) { throw new BadRequestException('Error finding blog media: ' + error.message); }
    }
    async update(id: number, updateBlogMediaDto: UpdateBlogMediaDto) {
        try {
            const blogMedia = await this.prisma.client.blog_media.update({ where: { id }, data: updateBlogMediaDto });
            return { message: 'Blog media updated successfully', blogMedia };
        } catch (error) { throw new BadRequestException('Error updating blog media'); }
    }
    async remove(id: number) {
        try {
            const blogMedia = await this.prisma.client.blog_media.findUnique({ where: { id: Number(id) } });
            if (!blogMedia) { throw new BadRequestException('Blog media not found'); }
            const deletedBlogMedia = await this.prisma.client.blog_media.delete({ where: { id: Number(id) } });
            return { message: 'Blog media deleted successfully', blogMedia: deletedBlogMedia };
        } catch (error) {
            if (error.message?.includes('not found') || error.message?.includes('does not exist')) { throw new BadRequestException('Blog media not found'); }
            throw new BadRequestException('Error deleting blog media: ' + error.message);
        }
    }
    async removeMediaByBlogId(blogId: number) {
        try {
            const mediaToDelete = await this.prisma.client.blog_media.findMany({ where: { blog_id: blogId } });
            if (mediaToDelete.length > 0) { await this.prisma.client.blog_media.deleteMany({ where: { blog_id: blogId } }); }
            return { message: `Deleted ${mediaToDelete.length} blog media items` };
        } catch (error) { throw new BadRequestException('Error deleting blog media by blog ID: ' + error.message); }
    }
    async getAverageRating(blogId: number): Promise<{ average: number; count: number }> {
        const blog = await this.prisma.client.blogs.findUnique({ where: { id: blogId } });
        if (!blog) { throw new NotFoundException('Blog not found'); }
        const ratings = await this.prisma.client.new_interactions.findMany({ where: { target_id: BigInt(blogId), target_type: 'BLOG', type: 'RATING' } });
        const count = ratings.length;
        const average = count > 0 ? ratings.reduce((sum, r) => sum + (parseFloat(r.value || '0') || 0), 0) / count : 0;
        return { average, count };
    }
}