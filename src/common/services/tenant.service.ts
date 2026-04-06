import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantService {
    constructor(private prisma: PrismaService) { }
    /**
     * Get company by origin URL
     * @param origin - The origin URL from request headers
     * @returns Company object or throws exception if not found
     */
    async getCompanyByOrigin(origin: string) {
        if (!origin) { throw new BadRequestException('Origin header is required'); }

        if (origin === 'oss-events-backend.vercel.app' || origin === 'oss-events-frontend.vercel.app' || origin.startsWith('oss-events-backend.vercel.app:') || origin.startsWith('oss-events-frontend.vercel.app:') || origin.includes('oss-events-backend.vercel.app') || origin.includes('oss-events-frontend.vercel.app')) {
            const defaultCompany = await this.prisma.client.companies.findFirst({
                where: {
                    OR: [
                        { url: 'https://oss-events-backend.vercel.app' },
                        { url: 'https://oss-events-frontend.vercel.app' },
                        { status: 1 }
                    ]
                },
                orderBy: { id: 'asc' }
            });
            if (defaultCompany) { return defaultCompany; }
            throw new BadRequestException('No company found for oss-events-backend.vercel.app. Please create a company with url in the database.');
        }
        const company = await this.prisma.client.companies.findFirst({
            where: {
                OR: [
                    { url: origin },
                    { url: `http://${origin}` },
                    { url: `https://${origin}` },
                    { url: origin.replace(/^https?:\/\//, '') },
                    // Also check for origin without port if it has one
                    ...(origin.includes(':') ? [{ url: origin.split(':')[0] }] : [])
                ],
                status: 1
            }
        });
        if (!company) {
            throw new BadRequestException(`No active company found for url: ${origin}. Searched for: ${origin}, http://${origin}, https://${origin}${origin.includes(':') ? `, ${origin.split(':')[0]}` : ''}`);
        }
        return company;
    }
    /**
     * Get company ID by origin URL
     * @param origin - The origin URL from request headers
     * @returns Company ID (bigint)
     */
    async getCompanyIdByOrigin(origin: string): Promise<bigint> {
        const company = await this.getCompanyByOrigin(origin);
        return company.id;
    }
    /**
     * Validate company exists and is active
     * @param companyId - Company ID to validate
     * @returns Company object
     */
    async validateCompany(companyId: bigint) {
        const company = await this.prisma.client.companies.findFirst({ where: { id: companyId, status: 1 } });
        if (!company) { throw new BadRequestException(`Company not found or inactive`); }
        return company;
    }
    /**
     * Get tenant categories with item counts
     * @param origin - Origin URL
     * @returns Categories with item counts for the tenant
     */
    async getTenantCategories(origin: string) {
        const company = await this.getCompanyByOrigin(origin);
        return this.prisma.client.categories.findMany({ where: { company_id: company.id, status: 1 }, include: { item_category: true }, orderBy: { id: 'desc' } });
    }
    /**
     * Get tenant categories with item counts
     * @param origin - Origin URL
     * @returns Categories with item counts for the tenant
     */
    async getTenantCategoriesWithItemCounts(origin: string, itemCount: number) {
        const company = await this.getCompanyByOrigin(origin);
        return this.prisma.client.categories.findMany({
            where: { company_id: company.id, status: 1, head_category_id: null },
            include: {
                item_category: true,
                children: { include: { item_category: true } }
            },
            orderBy: { id: 'desc' },
            take: itemCount
        });
    }
    /**
     * Get featured providers for tenant
     * @param origin - Origin URL
     * @param limit - Number of providers to return
     * @returns Featured providers with item counts
     */
    async getFeaturedProviders(origin: string, limit: number = 8, viewerId?: number) {
        const company = await this.getCompanyByOrigin(origin);
        const providers = await this.prisma.client.users.findMany({
            where: { company_id: company.id, role_id: BigInt(3), status: 1 },
            take: limit,
            include: {
                provider_info: {
                    where: { user_id: viewerId },
                    include: {
                        categories: true,
                        countries: true,
                        governorates: true,
                        municipalities: true
                    }
                },
                items: { where: { status: 1 }, select: { id: true } }
            },
            orderBy: { id: 'desc' }
        });

        if (providers.length === 0) return [];

        const providerIds = providers.map(p => p.id);
        const allItems = await this.prisma.client.items.findMany({
            where: { provider_id: { in: providerIds }, status: 1 },
            select: { id: true, provider_id: true }
        });

        const itemIds = allItems.map(i => i.id);
        const [allRatings, viewerReactions] = await Promise.all([
            this.prisma.client.new_interactions.findMany({
                where: { target_id: { in: itemIds }, target_type: 'ITEM', type: 'RATING' },
                select: { target_id: true, value: true }
            }),
            viewerId ? this.prisma.client.new_interactions.findMany({
                where: { user_id: BigInt(viewerId), target_type: 'ITEM', target_id: { in: itemIds } }
            }) : Promise.resolve<any[]>([])
        ]);

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

        const reactionsByItem = new Map<bigint, any[]>();
        viewerReactions?.forEach(r => {
            if (!reactionsByItem.has(r.target_id)) reactionsByItem.set(r.target_id, []);
            reactionsByItem.get(r.target_id)!.push(r);
        });

        const providersWithStats = providers.map(provider => {
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

            // Provider reactions? No straightforward provider reaction here in tenantService, 
            // but let's see if we can get isFavorite for the provider too.
            // For simplicity, we'll return userReactions for items inside this map.

            return {
                ...provider,
                rating: parseFloat(avgRating.toFixed(1)),
                reviewCount: totalReviews,
                itemCount: providerItems.length
            };
        });

        return providersWithStats;
    }
    /**
     * Get latest items
     */
    async getLatestItems(origin: string, limit: number = 6, viewerId?: number) {
        const company = await this.getCompanyByOrigin(origin);
        const items = await this.prisma.client.items.findMany({
            where: { company_id: company.id, status: 1 },
            orderBy: { id: 'desc' },
            take: limit,
            include: {
                users: {
                    include: {
                        provider_info: {
                            include: {
                                categories: true,
                                countries: true,
                                governorates: true,
                                municipalities: true
                            }
                        }
                    }
                },
                item_category: { include: { categories: true } }
            }
        });

        if (items.length === 0) return [];

        const itemIds = items.map(i => i.id);
        const [allRatings, viewerReactions] = await Promise.all([
            this.prisma.client.new_interactions.findMany({
                where: { target_id: { in: itemIds }, target_type: 'ITEM', type: 'RATING' },
                select: { target_id: true, value: true }
            }),
            viewerId ? this.prisma.client.new_interactions.findMany({
                where: { user_id: BigInt(viewerId), target_type: 'ITEM', target_id: { in: itemIds } }
            }) : Promise.resolve<any[]>([])
        ]);

        const ratingsByItem = new Map<bigint, any[]>();
        allRatings.forEach(r => {
            if (!ratingsByItem.has(r.target_id)) ratingsByItem.set(r.target_id, []);
            ratingsByItem.get(r.target_id)!.push(r);
        });

        const reactionsByItem = new Map<bigint, any[]>();
        viewerReactions?.forEach(r => {
            if (!reactionsByItem.has(r.target_id)) reactionsByItem.set(r.target_id, []);
            reactionsByItem.get(r.target_id)!.push(r);
        });

        return items.map(item => {
            const itemRatings = ratingsByItem.get(item.id) || [];
            const totalScore = itemRatings.reduce((sum, r) => sum + (parseFloat(r.value || '0') || 0), 0);
            const avgRating = itemRatings.length > 0 ? totalScore / itemRatings.length : 0;

            const itemReactions = reactionsByItem.get(item.id) || [];
            const userReactions = {
                isLiked: itemReactions.some(r => r.type === 'LIKE'),
                isFavorite: itemReactions.some(r => r.type === 'FAVORITE' || r.type === 'HEART'),
                userRating: itemReactions.find(r => r.type === 'RATING')?.value ? parseInt(itemReactions.find(r => r.type === 'RATING')!.value!) : null
            };

            return {
                ...item,
                stats: {
                    avgRating: parseFloat(avgRating.toFixed(1)),
                    totalRatings: itemRatings.length
                },
                userReactions
            };
        });
    }
    /**
     * Get latest blogs for tenant
     * @param origin - Origin URL
     * @param limit - Number of blogs to return
     * @returns Latest blog posts
     */
    async getLatestBlogs(origin: string, limit: number = 6) {
        const company = await this.getCompanyByOrigin(origin);
        return this.prisma.client.blogs.findMany({ where: { company_id: company.id, status: 1 }, orderBy: { date: 'desc' }, take: limit });
    }
    /**
     * Get tenant statistics
     * @param companyId - Company ID
     * @returns Object with various statistics
     */
    async getTenantStats(companyId: bigint) {
        const [eventsCount, providersCount, itemsCount, categoriesCount, blogsCount, audienceCount, newsletterSubscribers] = await Promise.all([
            this.prisma.client.events.count({ where: { company_id: companyId } }),
            this.prisma.client.users.count({ where: { company_id: companyId, role_id: BigInt(3), status: 1 } }),
            this.prisma.client.items.count({ where: { company_id: companyId, status: 1 } }),
            this.prisma.client.categories.count({ where: { company_id: companyId, status: 1 } }),
            this.prisma.client.blogs.count({ where: { company_id: companyId, status: 1 } }),
            this.prisma.client.events.groupBy({ by: ['client_id'], where: { company_id: companyId }, _count: true }).then(groups => groups.length),
            this.prisma.client.newsletter.count({ where: { company_id: companyId } })
        ]);
        return { eventsCreated: eventsCount, activeVendors: providersCount, activeServices: itemsCount, categoriesCount: categoriesCount, blogPosts: blogsCount, audienceCount: audienceCount, newsletterSubscribers: newsletterSubscribers };
    }
    /**
     * Get recent newsletter subscribers
     * @param origin - Origin URL
     * @param limit - Number of recent subscribers to return
     * @returns Recent newsletter subscribers with dates
     */
    async getRecentNewsletterSubscribers(origin: string, limit: number = 10) {
        const company = await this.getCompanyByOrigin(origin);
        return this.prisma.client.newsletter.findMany({ where: { company_id: company.id }, orderBy: { created_at: 'desc' }, take: limit, select: { email: true, created_at: true } });
    }
    /**
     * Get audience engagement metrics
     * @param companyId - Company ID
     * @returns Object with audience statistics
     */
    async getAudienceStats(companyId: bigint) {
        const uniqueClients = await this.prisma.client.events.groupBy({ by: ['client_id'], where: { company_id: companyId }, _count: true });
        const events = await this.prisma.client.events.findMany({ where: { company_id: companyId }, select: { start_date: true, end_date: true, event_lines: { select: { id: true } } } });
        const totalDuration = events.reduce((sum, event) => {
            if (event.start_date && event.end_date) {
                const duration = new Date(event.end_date).getTime() - new Date(event.start_date).getTime();
                return sum + (duration / (1000 * 60 * 60 * 24));
            }
            return sum;
        }, 0);
        const averageDuration = events.length > 0 ? totalDuration / events.length : 0;
        return {
            totalEvents: events.length,
            uniqueClients: uniqueClients.length,
            averageEventDuration: Math.round(averageDuration * 10) / 10,
            averageServicesPerEvent: events.length > 0 ? Math.round((events.reduce((sum, event) => sum + event.event_lines.length, 0) / events.length) * 10) / 10 : 0
        };
    }
}