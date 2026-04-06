import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type TargetType = 'CATEGORY' | 'ITEM' | 'PROVIDER' | 'BLOG';
export type InteractionType = 'LIKE' | 'DISLIKE' | 'RATING' | 'FAVORITE';

export interface CreateInteractionDto {
    userId: number;
    companyId?: number;
    targetType: TargetType;
    targetId: number;
    type: InteractionType;
    value?: string; // For ratings (1-5)
}

export interface GetReactionsDto {
    targetType: TargetType;
    targetId: number;
    userId?: number; // Optional, for getting user's specific reactions
}

@Injectable()
export class InteractionsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Toggle Like - If exists, remove it. If not, create it.
     * Also removes Dislike if present (can't have both)
     */
    async toggleLike(userId: number, targetType: TargetType, targetId: number, companyId?: number) {
        try {
            // Check if like already exists
            const existing = await this.prisma.client.new_interactions.findUnique({
                where: {
                    unique_user_target_type: {
                        user_id: BigInt(userId),
                        target_type: targetType,
                        target_id: BigInt(targetId),
                        type: 'LIKE',
                    },
                },
            });

            if (existing) {
                // Remove like
                await this.prisma.client.new_interactions.delete({
                    where: { id: existing.id },
                });

                const stats = await this.getReactionStats(targetType, targetId);
                return {
                    success: true,
                    isLiked: false,
                    totalLikes: stats.likes,
                    message: 'Like removed',
                };
            } else {
                // Remove dislike if exists (can't have both)
                await this.removeDislike(userId, targetType, targetId);

                // Add like
                await this.prisma.client.new_interactions.create({
                    data: {
                        user_id: BigInt(userId),
                        company_id: companyId ? BigInt(companyId) : null,
                        target_type: targetType,
                        target_id: BigInt(targetId),
                        type: 'LIKE',
                    },
                });

                const stats = await this.getReactionStats(targetType, targetId);
                return {
                    success: true,
                    isLiked: true,
                    totalLikes: stats.likes,
                    message: 'Liked successfully',
                };
            }
        } catch (error) {
            throw new BadRequestException(`Failed to toggle like: ${error.message}`);
        }
    }

    /**
     * Toggle Dislike - If exists, remove it. If not, create it.
     * Also removes Like if present (can't have both)
     */
    async toggleDislike(userId: number, targetType: TargetType, targetId: number, companyId?: number) {
        try {
            // Check if dislike already exists
            const existing = await this.prisma.client.new_interactions.findUnique({
                where: {
                    unique_user_target_type: {
                        user_id: BigInt(userId),
                        target_type: targetType,
                        target_id: BigInt(targetId),
                        type: 'DISLIKE',
                    },
                },
            });

            if (existing) {
                // Remove dislike
                await this.prisma.client.new_interactions.delete({
                    where: { id: existing.id },
                });

                const stats = await this.getReactionStats(targetType, targetId);
                return {
                    success: true,
                    isDisliked: false,
                    totalDislikes: stats.dislikes,
                    message: 'Dislike removed',
                };
            } else {
                // Remove like if exists (can't have both)
                await this.removeLike(userId, targetType, targetId);

                // Add dislike
                await this.prisma.client.new_interactions.create({
                    data: {
                        user_id: BigInt(userId),
                        company_id: companyId ? BigInt(companyId) : null,
                        target_type: targetType,
                        target_id: BigInt(targetId),
                        type: 'DISLIKE',
                    },
                });

                const stats = await this.getReactionStats(targetType, targetId);
                return {
                    success: true,
                    isDisliked: true,
                    totalDislikes: stats.dislikes,
                    message: 'Disliked successfully',
                };
            }
        } catch (error) {
            throw new BadRequestException(`Failed to toggle dislike: ${error.message}`);
        }
    }

    /**
     * Set or Update Rating (1-5)
     */
    async setRating(userId: number, targetType: TargetType, targetId: number, value: number, companyId?: number) {
        try {
            // Validate rating value
            if (value < 1 || value > 5) {
                throw new BadRequestException('Rating must be between 1 and 5');
            }

            // Upsert rating (update if exists, create if not)
            await this.prisma.client.new_interactions.upsert({
                where: {
                    unique_user_target_type: {
                        user_id: BigInt(userId),
                        target_type: targetType,
                        target_id: BigInt(targetId),
                        type: 'RATING',
                    },
                },
                create: {
                    user_id: BigInt(userId),
                    company_id: companyId ? BigInt(companyId) : null,
                    target_type: targetType,
                    target_id: BigInt(targetId),
                    type: 'RATING',
                    value: value.toString(),
                },
                update: {
                    value: value.toString(),
                },
            });

            const stats = await this.getRatingStats(targetType, targetId);
            return {
                success: true,
                userRating: value,
                avgRating: stats.avgRating,
                totalRatings: stats.totalRatings,
                message: 'Rating saved successfully',
            };
        } catch (error) {
            throw new BadRequestException(`Failed to set rating: ${error.message}`);
        }
    }

    /**
     * Toggle Favorite
     */
    async toggleFavorite(userId: number, targetType: TargetType, targetId: number, companyId?: number) {
        try {
            // Check if favorite already exists
            const existing = await this.prisma.client.new_interactions.findUnique({
                where: {
                    unique_user_target_type: {
                        user_id: BigInt(userId),
                        target_type: targetType,
                        target_id: BigInt(targetId),
                        type: 'FAVORITE',
                    },
                },
            });

            if (existing) {
                // Remove favorite
                await this.prisma.client.new_interactions.delete({
                    where: { id: existing.id },
                });

                return {
                    success: true,
                    isFavorite: false,
                    message: 'Removed from favorites',
                };
            } else {
                // Add favorite
                await this.prisma.client.new_interactions.create({
                    data: {
                        user_id: BigInt(userId),
                        company_id: companyId ? BigInt(companyId) : null,
                        target_type: targetType,
                        target_id: BigInt(targetId),
                        type: 'FAVORITE',
                    },
                });

                return {
                    success: true,
                    isFavorite: true,
                    message: 'Added to favorites',
                };
            }
        } catch (error) {
            throw new BadRequestException(`Failed to toggle favorite: ${error.message}`);
        }
    }

    /**
     * Get all reaction stats for a target
     */
    async getReactionStats(targetType: TargetType, targetId: number) {
        try {
            const stats = await this.prisma.client.new_interactions.groupBy({
                by: ['type'],
                where: {
                    target_type: targetType,
                    target_id: BigInt(targetId),
                    type: { in: ['LIKE', 'DISLIKE', 'FAVORITE'] },
                },
                _count: true,
            });

            const ratingStats = await this.getRatingStats(targetType, targetId);

            return {
                likes: stats.find(s => s.type === 'LIKE')?._count || 0,
                dislikes: stats.find(s => s.type === 'DISLIKE')?._count || 0,
                favorites: stats.find(s => s.type === 'FAVORITE')?._count || 0,
                avgRating: ratingStats.avgRating,
                totalRatings: ratingStats.totalRatings,
            };
        } catch (error) {
            throw new BadRequestException(`Failed to get reaction stats: ${error.message}`);
        }
    }

    /**
     * Get user's specific reactions for a target
     */
    async getUserReactions(userId: number, targetType: TargetType, targetId: number) {
        try {
            const reactions = await this.prisma.client.new_interactions.findMany({
                where: {
                    user_id: BigInt(userId),
                    target_type: targetType,
                    target_id: BigInt(targetId),
                },
            });

            const like = reactions.find(r => r.type === 'LIKE');
            const dislike = reactions.find(r => r.type === 'DISLIKE');
            const rating = reactions.find(r => r.type === 'RATING');
            const favorite = reactions.find(r => r.type === 'FAVORITE');

            return {
                isLiked: !!like,
                isDisliked: !!dislike,
                userRating: rating ? parseInt(rating.value || '0') : null,
                isFavorite: !!favorite,
            };
        } catch (error) {
            throw new BadRequestException(`Failed to get user reactions: ${error.message}`);
        }
    }

    /**
     * Get user's favorites list with pagination
     */
    async getUserFavorites(userId: number, targetType?: TargetType, page: number = 1, limit: number = 20) {
        try {
            const where: any = {
                user_id: BigInt(userId),
                type: 'FAVORITE',
            };

            if (targetType) {
                where.target_type = targetType;
            }

            const [data, total] = await Promise.all([
                this.prisma.client.new_interactions.findMany({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { created_at: 'desc' },
                }),
                this.prisma.client.new_interactions.count({ where }),
            ]);

            return {
                success: true,
                data,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            throw new BadRequestException(`Failed to get favorites: ${error.message}`);
        }
    }

    /**
     * Helper: Remove like if exists
     */
    private async removeLike(userId: number, targetType: TargetType, targetId: number) {
        await this.prisma.client.new_interactions.deleteMany({
            where: {
                user_id: BigInt(userId),
                target_type: targetType,
                target_id: BigInt(targetId),
                type: 'LIKE',
            },
        });
    }

    /**
     * Helper: Remove dislike if exists
     */
    private async removeDislike(userId: number, targetType: TargetType, targetId: number) {
        await this.prisma.client.new_interactions.deleteMany({
            where: {
                user_id: BigInt(userId),
                target_type: targetType,
                target_id: BigInt(targetId),
                type: 'DISLIKE',
            },
        });
    }

    /**
     * Helper: Get rating statistics
     */
    private async getRatingStats(targetType: TargetType, targetId: number) {
        const ratings = await this.prisma.client.new_interactions.findMany({
            where: {
                target_type: targetType,
                target_id: BigInt(targetId),
                type: 'RATING',
            },
            select: { value: true },
        });

        const totalRatings = ratings.length;
        const avgRating = totalRatings > 0
            ? ratings.reduce((sum, r) => sum + parseFloat(r.value || '0'), 0) / totalRatings
            : 0;

        return {
            avgRating: parseFloat(avgRating.toFixed(2)),
            totalRatings,
        };
    }
}