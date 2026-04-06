import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type TargetType = 'CATEGORY' | 'ITEM' | 'PROVIDER' | 'BLOG';

export interface CreateCommentDto {
    userId: number;
    companyId?: number;
    targetType: TargetType;
    targetId: number;
    content: string;
}

export interface UpdateCommentDto { content: string; }

export interface GetCommentsDto {
    targetType: TargetType;
    targetId: number;
    page?: number;
    limit?: number;
    includeDeleted?: boolean;
}

@Injectable()
export class CommentsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Create a new comment
     */
    async createComment(dto: CreateCommentDto) {
        try {
            if (!dto.content || dto.content.trim().length === 0) { throw new BadRequestException('Comment content cannot be empty'); }
            if (dto.content.length > 5000) { throw new BadRequestException('Comment content exceeds maximum length of 5000 characters'); }
            const sanitizedContent = this.sanitizeContent(dto.content);
            const comment = await this.prisma.client.comments.create({
                data: { user_id: BigInt(dto.userId), company_id: dto.companyId ? BigInt(dto.companyId) : null, target_type: dto.targetType, target_id: BigInt(dto.targetId), content: sanitizedContent },
                include: { users: { select: { id: true, firstname: true, lastname: true, avatar: true } } }
            });
            return { success: true, comment: this.formatComment(comment), message: 'Comment created successfully' };
        } catch (error) {
            if (error instanceof BadRequestException) { throw error; }
            throw new BadRequestException(`Failed to create comment: ${error.message}`);
        }
    }

    /**
     * Get comments for a target with pagination
     */
    async getComments(dto: GetCommentsDto) {
        try {
            const page = dto.page || 1;
            const limit = dto.limit || 20;
            const skip = (page - 1) * limit;
            const where: any = { target_type: dto.targetType, target_id: BigInt(dto.targetId) };
            if (!dto.includeDeleted) { where.is_deleted = false; }
            const [data, total] = await Promise.all([
                this.prisma.client.comments.findMany({ where, skip, take: limit, orderBy: { created_at: 'desc' }, include: { users: { select: { id: true, firstname: true, lastname: true, avatar: true } } } }),
                this.prisma.client.comments.count({ where }),
            ]);
            return { success: true, data: data.map(c => this.formatComment(c)), pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
        } catch (error) { throw new BadRequestException(`Failed to get comments: ${error.message}`); }
    }

    /**
     * Update a comment (owner only)
     */
    async updateComment(commentId: number, userId: number, dto: UpdateCommentDto, isAdmin: boolean = false) {
        try {
            if (!dto.content || dto.content.trim().length === 0) { throw new BadRequestException('Comment content cannot be empty'); }
            if (dto.content.length > 5000) { throw new BadRequestException('Comment content exceeds maximum length of 5000 characters'); }
            const existing = await this.prisma.client.comments.findUnique({ where: { id: BigInt(commentId) } });
            if (!existing) { throw new NotFoundException('Comment not found'); }
            if (Number(existing.user_id) !== userId && !isAdmin) { throw new ForbiddenException('You can only edit your own comments'); }
            if (existing.is_deleted) { throw new BadRequestException('Cannot edit a deleted comment'); }
            const sanitizedContent = this.sanitizeContent(dto.content);
            const updated = await this.prisma.client.comments.update({
                where: { id: BigInt(commentId) },
                data: { content: sanitizedContent, is_edited: true, edited_at: new Date() },
                include: { users: { select: { id: true, firstname: true, lastname: true, avatar: true } } },
            });
            return { success: true, comment: this.formatComment(updated), message: 'Comment updated successfully' };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof ForbiddenException) { throw error; }
            throw new BadRequestException(`Failed to update comment: ${error.message}`);
        }
    }

    /**
     * Delete a comment (soft delete, owner or admin only)
     */
    async deleteComment(commentId: number, userId: number, roleId: number = 0) {
        try {
            const isAdmin = roleId === 1 || roleId === 2;
            const isRoot = roleId === 1;
            const existing = await this.prisma.client.comments.findUnique({ where: { id: BigInt(commentId) } });
            if (!existing) { throw new NotFoundException('Comment not found'); }
            if (Number(existing.user_id) !== userId && !isAdmin) { throw new ForbiddenException('You can only delete your own comments'); }
            if (isRoot) {
                await this.prisma.client.comments.delete({ where: { id: BigInt(commentId) } });
                return { success: true, message: 'Comment permanently deleted' };
            }
            if (existing.is_deleted) { return { success: true, message: 'Comment already deleted' }; }
            await this.prisma.client.comments.update({ where: { id: BigInt(commentId) }, data: { is_deleted: true, deleted_at: new Date() } });
            return { success: true, message: 'Comment deleted successfully' };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof ForbiddenException) { throw error; }
            throw new BadRequestException(`Failed to delete comment: ${error.message}`);
        }
    }

    /**
     * Partially update a comment (e.g. for soft-delete/restore)
     */
    async patchComment(commentId: number, userId: number, dto: any, isAdmin: boolean = false) {
        try {
            const existing = await this.prisma.client.comments.findUnique({ where: { id: BigInt(commentId) } });
            if (!existing) { throw new NotFoundException('Comment not found'); }

            // Allow update if owner OR admin
            if (Number(existing.user_id) !== userId && !isAdmin) {
                throw new ForbiddenException('You do not have permission to update this comment');
            }

            const data: any = {};
            if (dto.content !== undefined) {
                if (dto.content.trim().length === 0) throw new BadRequestException('Content cannot be empty');
                data.content = this.sanitizeContent(dto.content);
                data.is_edited = true;
                data.edited_at = new Date();
            }

            if (dto.isDeleted !== undefined && isAdmin) {
                data.is_deleted = dto.isDeleted;
                if (dto.isDeleted) {
                    data.deleted_at = new Date();
                } else {
                    data.deleted_at = null;
                }
            }

            const updated = await this.prisma.client.comments.update({
                where: { id: BigInt(commentId) },
                data,
                include: { users: { select: { id: true, firstname: true, lastname: true, avatar: true } } },
            });

            return { success: true, comment: this.formatComment(updated), message: 'Comment updated successfully' };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof ForbiddenException) { throw error; }
            throw new BadRequestException(`Failed to patch comment: ${error.message}`);
        }
    }

    /**
     * Get comment count for a target
     */
    async getCommentCount(targetType: TargetType, targetId: number) {
        try {
            const count = await this.prisma.client.comments.count({ where: { target_type: targetType, target_id: BigInt(targetId), is_deleted: false } });
            return { success: true, count };
        } catch (error) { throw new BadRequestException(`Failed to get comment count: ${error.message}`); }
    }

    /**
     * Get user's comments with pagination
     */
    async getUserComments(userId: number, page: number = 1, limit: number = 20) {
        try {
            const skip = (page - 1) * limit;
            const [data, total] = await Promise.all([
                this.prisma.client.comments.findMany({ where: { user_id: BigInt(userId), is_deleted: false }, skip, take: limit, orderBy: { created_at: 'desc' } }),
                this.prisma.client.comments.count({ where: { user_id: BigInt(userId), is_deleted: false } })
            ]);
            return { success: true, data: data.map(c => this.formatComment(c)), pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
        } catch (error) { throw new BadRequestException(`Failed to get user comments: ${error.message}`); }
    }

    /**
     * Helper: Sanitize comment content (basic XSS prevention)
     */
    private sanitizeContent(content: string): string {
        let sanitized = content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
            .replace(/<embed[^>]*>/gi, '')
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
        return sanitized.trim();
    }

    /**
     * Helper: Format comment for response
     */
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
}
