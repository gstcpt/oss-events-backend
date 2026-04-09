import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../common/services/tenant.service';
import { PageViewService } from '../../common/services/pageview.service';
import { PageEventService } from '../../common/services/pageevent.service';

@Injectable()
export class PublicPageItemsService {
    constructor(private prisma: PrismaService, private tenantService: TenantService, private pageViewService: PageViewService, private pageEventService: PageEventService) { }
    async getPublicPageItems(origin: string, userId?: number, query?: { page?: number; limit?: number; search?: string; categoryIds?: string; sortBy?: string }) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            const page = Number(query?.page) || 1;
            const limit = Number(query?.limit) || 1000; // Default to 1000 if not specified (legacy behavior)
            const skip = (page - 1) * limit;

            const where: any = { status: 1, company_id: company.id };

            if (query?.search) { where.OR = [{ title: { contains: query.search } }, { description: { contains: query.search } }]; }

            if (query?.categoryIds) {
                const catIds = query.categoryIds.split(',').map(id => Number(id));
                where.item_category = { some: { category_id: { in: catIds } } };
            }

            // Optimized Include: Only what's needed for the LIST view
            const items = await this.prisma.client.items.findMany({
                where,
                include: {
                    item_category: { include: { categories: { select: { id: true, title: true } } } },
                    item_media: { take: 1 },
                    users: { select: { id: true, firstname: true, lastname: true, avatar: true, provider_info: { select: { municipalities: { select: { name: true } }, governorates: { select: { name: true } } } } } }
                },
                orderBy: { id: 'desc' },
                skip: query?.limit ? skip : undefined,
                take: query?.limit ? limit : undefined
            });

            const totalCount = await this.prisma.client.items.count({ where });

            if (items.length === 0) return { items: [], totalCount: 0 };

            const itemIds = items.map((i) => i.id);

            // Fetch interaction stats efficiently
            const [reactionCounts, ratings] = await Promise.all([
                this.prisma.client.new_interactions.groupBy({ by: ['target_id', 'type'], where: { target_id: { in: itemIds }, target_type: 'ITEM' }, _count: { id: true } }),
                this.prisma.client.new_interactions.findMany({ where: { target_id: { in: itemIds }, target_type: 'ITEM', type: 'RATING' }, select: { target_id: true, value: true } })
            ]);

            // Get view counts
            const viewCounts = await this.prisma.client.page_view.groupBy({ by: ['resourceId'], where: { resourceId: { in: itemIds.map(id => Number(id)) }, resourceType: 'items', company_id: company.id }, _count: { id: true } });

            const viewMap = new Map(viewCounts.map(v => [Number(v.resourceId), v._count.id]));

            const userReactionsMap = new Map();
            if (userId) {
                const userInt = await this.prisma.client.new_interactions.findMany({ where: { user_id: BigInt(userId), target_id: { in: itemIds }, target_type: 'ITEM' } });
                userInt.forEach(i => userReactionsMap.set(`${i.target_id}_${i.type}`, i));
            }

            const processedItems = items.map((item) => {
                const id = item.id;
                const counts = reactionCounts.filter(s => s.target_id === id);
                const itemRatings = ratings.filter(r => r.target_id === id);

                const avgRating = itemRatings.length > 0
                    ? itemRatings.reduce((acc, curr) => acc + (parseFloat(curr.value || '0') || 0), 0) / itemRatings.length
                    : 0;

                return {
                    ...item,
                    stats: {
                        likes: counts.find(s => s.type === 'LIKE')?._count.id || 0,
                        dislikes: counts.find(s => s.type === 'DISLIKE')?._count.id || 0,
                        favorites: counts.find(s => s.type === 'FAVORITE')?._count.id || 0,
                        avgRating: parseFloat(avgRating.toFixed(1)),
                        totalRatings: itemRatings.length,
                        views: viewMap.get(Number(id)) || 0,
                        shares: 0
                    },
                    userReactions: {
                        isLiked: userReactionsMap.has(`${id}_LIKE`),
                        isDisliked: userReactionsMap.has(`${id}_DISLIKE`),
                        isFavorite: userReactionsMap.has(`${id}_FAVORITE`),
                        userRating: userReactionsMap.has(`${id}_RATING`) ? parseFloat(userReactionsMap.get(`${id}_RATING`).value || '0') : null
                    }
                };
            });

            return { items: processedItems, totalCount };
        } catch (error) { throw new BadRequestException('Failed to fetch items'); }
    }

    async getItemById(id: number, origin: string, userId?: number) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            const includeClause: any = {
                item_category: { include: { categories: true } },
                item_media: true,
                users: { include: { provider_info: { include: { countries: true, governorates: true, municipalities: true, provider_opening_hour: true, provider_opening_exception: true } } } },
                item_sections: { include: { tags: true, item_section_options: { include: { tagOptions: true } } } }
            };
            const [item, interactions, itemComments, viewStats, shareStats] = await Promise.all([
                this.prisma.client.items.findUnique({ where: { id: id, status: 1, company_id: company.id }, include: includeClause }),
                this.prisma.client.new_interactions.findMany({
                    where: { target_id: BigInt(id), target_type: 'ITEM' },
                    include: { users: { select: { id: true, firstname: true, lastname: true, avatar: true } } },
                    orderBy: { id: 'desc' }
                }),
                this.prisma.client.comments.findMany({
                    where: { target_id: BigInt(id), target_type: 'ITEM', is_deleted: false },
                    include: { users: { select: { id: true, firstname: true, lastname: true, avatar: true } } },
                    orderBy: { created_at: 'desc' }
                }),
                this.pageViewService.getViewStats({ resourceType: 'items', resourceId: id }),
                this.pageEventService.getShareCount('items', id, company.id)
            ]);
            if (!item) { throw new BadRequestException('Item not found'); }
            const reactionCounts = await this.prisma.client.new_interactions.groupBy({ by: ['type'], where: { target_id: BigInt(id), target_type: 'ITEM' }, _count: { id: true } });
            const likes = reactionCounts.find(c => c.type === 'LIKE')?._count.id || 0;
            const dislikes = reactionCounts.find(c => c.type === 'DISLIKE')?._count.id || 0;
            const favorites = reactionCounts.find(c => c.type === 'FAVORITE')?._count.id || 0;
            const ratingInteractions = interactions.filter(i => i.type === 'RATING');
            const totalRatings = reactionCounts.find(c => c.type === 'RATING')?._count.id || 0;
            const sumOfRatings = ratingInteractions.reduce((acc, i) => acc + (parseFloat(i.value || '0') || 0), 0);
            const avgRating = totalRatings > 0 ? sumOfRatings / ratingInteractions.length : 0;
            const views = viewStats.success ? viewStats.stats.totalViews : 0;
            const shares = shareStats.success ? shareStats.shareCount : 0;
            let userReactions = { isLiked: false, isDisliked: false, userRating: null as number | null, isFavorite: false };
            if (userId) {
                const userActions = await this.prisma.client.new_interactions.findMany({ where: { user_id: BigInt(userId), target_id: BigInt(id), target_type: 'ITEM' } });
                userReactions.isLiked = userActions.some(a => a.type === 'LIKE');
                userReactions.isDisliked = userActions.some(a => a.type === 'DISLIKE');
                userReactions.isFavorite = userActions.some(a => a.type === 'FAVORITE');
                const ratingAction = userActions.find(a => a.type === 'RATING');
                userReactions.userRating = ratingAction ? parseFloat(ratingAction.value || '0') : null;
            }
            const response = {
                ...item,
                interactions: interactions.map(i => ({ ...i, id: i.id.toString(), user_id: i.user_id.toString(), target_id: i.target_id.toString(), company_id: i.company_id?.toString() })),
                comments: itemComments.map(c => ({ ...c, id: c.id.toString(), user_id: c.user_id.toString(), target_id: c.target_id.toString(), company_id: c.company_id?.toString() })),
                stats: { likes, dislikes, favorites, avgRating: parseFloat(avgRating.toFixed(1)), totalRatings, views, shares },
                userReactions
            };
            return response;
        } catch (error) { throw new BadRequestException('Failed to fetch item with complete details'); }
    }

    async getSimilaireItems(itemId: number) {
        try {
            const item = await this.prisma.client.items.findUnique({ where: { id: itemId } });
            if (!item) { throw new BadRequestException('Item not found'); }
            const itemCategories = await this.prisma.client.item_category.findMany({ where: { item_id: item.id }, include: { categories: true } });
            if (itemCategories.length === 0) { throw new BadRequestException('Item has no categories'); }
            const categoryIds = itemCategories.map((ic) => ic.category_id);
            const similarItems = await this.prisma.client.items.findMany({
                where: { id: { not: itemId }, status: 1, company_id: item.company_id, item_category: { some: { category_id: { in: categoryIds } } } },
                include: {
                    item_category: { include: { categories: true } },
                    item_media: true,
                    users: { include: { provider_info: { include: { provider_opening_hour: true, provider_opening_exception: true } } } },
                    item_sections: { include: { tags: true } }
                },
                orderBy: { id: 'desc' },
                take: 4
            });

            return similarItems;
        } catch (error) { throw new BadRequestException('Failed to fetch similar items'); }
    }

    async getCategoryFilters(origin: string, categoryIdsStr?: string) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            // Step 1: Build item filter
            let itemWhere: any = { status: 1, company_id: company.id };
            if (categoryIdsStr) {
                const categoryIds = categoryIdsStr.split(',').map(id => BigInt(id));
                itemWhere.item_category = { some: { category_id: { in: categoryIds } } };
            }

            // Step 2: Fetch items with their sections, tags, and section options
            const items = await this.prisma.client.items.findMany({
                where: itemWhere,
                select: {
                    id: true,
                    title: true,
                    item_sections: {
                        include: {
                            tags: true,
                            item_section_options: { include: { tagOptions: true } }
                        }
                    }
                }
            });


            // Step 3: Walk sections — only include tags with filter_option === 1
            const tagMap = new Map<number, {
                id: number;
                icon: string | null;
                title: string;
                type: string | null;
                optionValues: Set<string>;
            }>();

            for (const item of items) {
                for (const section of item.item_sections) {
                    const tag = section.tags;
                    if (!tag || tag.filter_option !== 1) continue;

                    const tagId = Number(tag.id);
                    if (!tagMap.has(tagId)) {
                        tagMap.set(tagId, {
                            id: tagId,
                            icon: tag.icon ?? null,
                            title: tag.title,
                            // ✅ Normalize to UPPERCASE — DB stores 'select'/'checkbox' but frontend checks 'SELECT'/'CHECKBOX'
                            type: tag.type ? tag.type.toUpperCase() : null,
                            optionValues: new Set<string>()
                        });
                    }

                    const entry = tagMap.get(tagId)!;
                    for (const opt of section.item_section_options) {
                        const val = opt.tagOptions?.option_value ?? opt.option_value;
                        if (val) entry.optionValues.add(val);
                    }
                }
            }

            // Step 4: Serialize
            const result = Array.from(tagMap.values()).map(tag => ({
                id: tag.id,
                icon: tag.icon,
                title: tag.title,
                type: tag.type,
                tag_options: Array.from(tag.optionValues).map((val, idx) => ({ id: idx, option_value: val }))
            }));

            return result;
        } catch (error) {
            throw new BadRequestException('Failed to fetch category filters');
        }
    }
}