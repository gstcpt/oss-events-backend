import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../common/services/tenant.service';

@Injectable()
export class PublicPageCategoriesService {
    constructor(private prisma: PrismaService, private tenantService: TenantService) { }
    async getPublicPageCategories(origin: string) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            const categories = await this.prisma.client.categories.findMany({
                where: { status: 1, head_category_id: null, company_id: company.id },
                include: {
                    item_category: true,
                    children: { where: { status: 1, company_id: company.id }, include: { item_category: true, category_tags: { where: { tags: { filter_option: 1 } }, include: { tags: true } } } },
                    category_tags: { where: { tags: { filter_option: 1 } }, include: { tags: true } }
                },
                orderBy: { title: 'asc' }
            });
            return categories;
        } catch (error) { throw new BadRequestException('Failed to fetch categories'); }
    }
    async getCategoryById(id: number, origin: string) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            const category = await this.prisma.client.categories.findUnique({
                where: { id: id, status: 1, company_id: company.id },
                include: {
                    item_category: true,
                    children: { where: { status: 1, company_id: company.id }, include: { item_category: true, category_tags: { where: { tags: { filter_option: 1 } }, include: { tags: true } } } },
                    category_tags: { where: { tags: { filter_option: 1 } }, include: { tags: true } },
                    parent_category: true
                }
            });
            if (!category) { throw new BadRequestException('Category not found'); }
            return category;
        } catch (error) { throw new BadRequestException('Failed to fetch category'); }
    }
    async getCategoryItems(categoryId: number, filters: any, origin: string) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            const whereConditions: any = { status: 1, company_id: company.id, item_category: { some: { category_id: categoryId } } };
            if (filters.search) { whereConditions.OR = [{ title: { contains: filters.search, mode: 'insensitive' } }, { description: { contains: filters.search, mode: 'insensitive' } }]; }
            if (filters.tags && filters.tags.length > 0) { whereConditions.item_sections = { some: { tags: { id: { in: filters.tags.map(Number) } } } }; }
            const skip = (filters.page - 1) * filters.limit;
            const [items, totalCount] = await Promise.all([
                this.prisma.client.items.findMany({
                    where: whereConditions,
                    include: { item_category: { include: { categories: true } }, item_media: { take: 1 }, users: { include: { provider_info: true } }, item_sections: { include: { tags: true } } },
                    orderBy: this.getOrderBy(filters.sortBy),
                    skip: skip,
                    take: filters.limit
                }),
                this.prisma.client.items.count({ where: whereConditions })
            ]);
            return { items, totalCount, totalPages: Math.ceil(totalCount / filters.limit), currentPage: filters.page };
        } catch (error) { throw new BadRequestException('Failed to fetch category items'); }
    }
    private getOrderBy(sortBy: string) {
        switch (sortBy) {
            case 'price-low':
                return { price: 'asc' as const };
            case 'price-high':
                return { price: 'desc' as const };
            case 'rating':
                return { id: 'asc' as const };
            case 'newest':
                return { id: 'desc' as const };
            default:
                return { id: 'asc' as const };
        }
    }
}
