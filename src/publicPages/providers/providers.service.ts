import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../common/services/tenant.service';
import { PageViewService } from '../../common/services/pageview.service';
import { PageEventService } from '../../common/services/pageevent.service';
import { InteractionsService } from '../../common/services/interactions.service';

@Injectable()
export class PublicPageProvidersService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService,
        private pageViewService: PageViewService,
        private pageEventService: PageEventService,
        private interactionsService: InteractionsService
    ) { }
    /**
     * Get all providers for a company/tenant
     */
    async getAllProviders(origin: string) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            const providers = await this.prisma.client.users.findMany({
                where: { company_id: company.id, role_id: BigInt(3), status: 1 },
                include: {
                    provider_info: {
                        include: {
                            categories: true,
                            countries: true,
                            governorates: true,
                            municipalities: true,
                            provider_opening_hour: true,
                            provider_opening_exception: true
                        }
                    }
                },
                orderBy: { id: 'desc' }
            });

            if (providers.length === 0) return [];

            const providerIds = providers.map(p => p.id);

            // Fetch all items for these providers in one go
            const allItems = await this.prisma.client.items.findMany({
                where: { provider_id: { in: providerIds }, status: 1 },
                select: { id: true, provider_id: true }
            });

            const itemIds = allItems.map(i => i.id);

            // Fetch all rating interactions for these items in one go
            const allRatings = await this.prisma.client.new_interactions.findMany({
                where: { target_id: { in: itemIds }, target_type: 'ITEM', type: 'RATING' },
                select: { target_id: true, value: true }
            });

            // Map everything together for O(N) performance
            const itemsByProvider = new Map<bigint, { id: bigint }[]>();
            allItems.forEach(item => {
                if (!item.provider_id) return;
                if (!itemsByProvider.has(item.provider_id)) itemsByProvider.set(item.provider_id, []);
                itemsByProvider.get(item.provider_id)!.push(item as any);
            });

            const ratingsByItem = new Map<bigint, any[]>();
            allRatings.forEach(r => {
                if (!ratingsByItem.has(r.target_id)) ratingsByItem.set(r.target_id, []);
                ratingsByItem.get(r.target_id)!.push(r);
            });

            return providers.map(provider => {
                const providerItems = itemsByProvider.get(provider.id) || [];
                let totalScore = 0;
                let totalReviews = 0;

                providerItems.forEach(item => {
                    const itemRatings = ratingsByItem.get(item.id) || [];
                    itemRatings.forEach(r => {
                        totalScore += (parseFloat(r.value || '0') || 0);
                        totalReviews++;
                    });
                });

                const avgRating = totalReviews > 0 ? totalScore / totalReviews : 0;

                return {
                    ...provider,
                    rating: parseFloat(avgRating.toFixed(1)),
                    reviewCount: totalReviews,
                    itemCount: providerItems.length
                };
            });
        } catch (error) {throw new BadRequestException('Failed to fetch providers');}
    }

    /**
     * Get single provider by user ID
     */
    async getProviderById(providerId: number, origin: string, viewerId?: number) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            
            // First fetch the provider
            const provider = await this.prisma.client.users.findUnique({
                where: { id: BigInt(providerId), company_id: company.id, role_id: BigInt(3), status: 1 },
                include: {
                    provider_info: {
                        include: {
                            categories: true,
                            countries: true,
                            governorates: true,
                            municipalities: true,
                            provider_opening_hour: true,
                            provider_opening_exception: true
                        }
                    }
                }
            });

            if (!provider) { throw new BadRequestException('Provider not found'); }

            // Parallel fetch for everything else
            const [items, viewStats, shareStats, providerInteractions, viewerProviderReactions] = await Promise.all([
                this.prisma.client.items.findMany({ 
                    where: { provider_id: provider.id, status: 1 }, 
                    include: { 
                        item_category: { include: { categories: { select: { id: true, title: true } } } }, 
                        item_media: { take: 1 } 
                    }, 
                    orderBy: { id: 'desc' },
                    take: 24 // Limit to 24 items in initial load
                }),
                this.pageViewService.getViewStats({ resourceType: 'providers', resourceId: providerId, companyId: company.id }),
                this.pageEventService.getShareCount('providers', providerId, company.id),
                this.prisma.client.new_interactions.findMany({ where: { target_id: BigInt(providerId), target_type: 'PROVIDER' } }),
                viewerId ? this.interactionsService.getUserReactions(viewerId, 'PROVIDER', providerId) : Promise.resolve(null)
            ]);

            let totalReviews = 0;
            let avgRating = 0;
            let itemsWithStats: any[] = [];

            if (items.length > 0) {
                const itemIds = items.map(item => item.id);
                // Optimized: fetch only counts and necessary interactions
                const [itemRatingsDB, itemViewCounts, viewerItemReactions] = await Promise.all([
                    this.prisma.client.new_interactions.findMany({ 
                        where: { target_id: { in: itemIds }, target_type: 'ITEM', type: 'RATING' },
                        select: { target_id: true, value: true }
                    }),
                    this.prisma.client.page_view.groupBy({
                        by: ['resourceId'],
                        where: { resourceId: { in: itemIds.map(id => Number(id)) }, resourceType: 'items', company_id: company.id },
                        _count: { id: true }
                    }),
                    viewerId ? this.prisma.client.new_interactions.findMany({
                        where: { user_id: BigInt(viewerId), target_type: 'ITEM', target_id: { in: itemIds } }
                    }) : Promise.resolve<any[]>([])
                ]);

                const viewMap = new Map(itemViewCounts.map(v => [Number(v.resourceId), v._count.id]));
                const ratingsByItem = new Map<bigint, any[]>();
                itemRatingsDB.forEach(r => {
                    if (!ratingsByItem.has(r.target_id)) ratingsByItem.set(r.target_id, []);
                    ratingsByItem.get(r.target_id)!.push(r);
                });

                const reactionsByItem = new Map<bigint, any[]>();
                viewerItemReactions?.forEach(r => {
                    if (!reactionsByItem.has(r.target_id)) reactionsByItem.set(r.target_id, []);
                    reactionsByItem.get(r.target_id)!.push(r);
                });

                let grandTotalScore = 0;
                totalReviews = itemRatingsDB.length;

                itemsWithStats = items.map(item => {
                    const itemRatings = ratingsByItem.get(item.id) || [];
                    const itemScore = itemRatings.reduce((acc, r) => acc + (parseFloat(r.value || '0') || 0), 0);
                    const itemAvg = itemRatings.length > 0 ? itemScore / itemRatings.length : 0;
                    grandTotalScore += itemScore;
                    
                    const itemReactions = reactionsByItem.get(item.id) || [];
                    const userReactions = {
                        isLiked: itemReactions.some(r => r.type === 'LIKE'),
                        isFavorite: itemReactions.some(r => r.type === 'FAVORITE' || r.type === 'HEART'),
                        userRating: itemReactions.find(r => r.type === 'RATING')?.value ? parseInt(itemReactions.find(r => r.type === 'RATING')!.value!) : null
                    };

                    return { 
                        ...item, 
                        stats: {
                            avgRating: parseFloat(itemAvg.toFixed(1)),
                            totalRatings: itemRatings.length,
                            views: viewMap.get(Number(item.id)) || 0,
                            userReactions
                        }
                    } as any;
                });

                if (totalReviews > 0) {
                    avgRating = grandTotalScore / totalReviews;
                }
            }

            const likes = providerInteractions.filter(i => i.type === 'LIKE').length;
            const dislikes = providerInteractions.filter(i => i.type === 'DISLIKE').length;
            const favorites = providerInteractions.filter(i => i.type === 'FAVORITE').length;
            const ratingsForProvider = providerInteractions.filter(i => i.type === 'RATING');
            
            const directRating = ratingsForProvider.length > 0
                ? ratingsForProvider.reduce((acc, r) => acc + (parseFloat(r.value || '0') || 0), 0) / ratingsForProvider.length
                : 0;

            const stats = {
                views: viewStats.success ? viewStats.stats.totalViews : 0,
                shares: shareStats.success ? shareStats.shareCount : 0,
                likes,
                dislikes,
                favorites,
                directRating: parseFloat(directRating.toFixed(1)),
                directRatingCount: ratingsForProvider.length,
                userReactions: viewerProviderReactions
            };

            return {
                ...provider,
                rating: parseFloat(avgRating.toFixed(1)),
                reviewCount: totalReviews,
                itemCount: items.length,
                items: itemsWithStats,
                stats
            };
        } catch (error) { throw new BadRequestException('Failed to fetch provider details'); }
    }
}