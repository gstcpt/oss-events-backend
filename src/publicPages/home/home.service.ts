import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../common/services/tenant.service';

@Injectable()
export class PublicPageHomeService {
    constructor(private prisma: PrismaService, private tenantService: TenantService) { }
    async getHomePageStats(url: string) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(url);
            return await this.tenantService.getTenantStats(company.id);
        } catch (error) { throw new BadRequestException('No home page stats found with this company URL'); }
    }
    async getCategories(url: string) { try { return await this.tenantService.getTenantCategoriesWithItemCounts(url, 6); } catch (error) { throw new BadRequestException('No categories found with this company URL'); } }
    async getProviders(url: string, userId?: number) { try { return await this.tenantService.getFeaturedProviders(url, 6, userId); } catch (error) { throw new BadRequestException('No providers found with this company URL'); } }
    async getBlogs(url: string) { try { return await this.tenantService.getLatestBlogs(url, 6); } catch (error) { throw new BadRequestException('No blogs found with this company URL'); } }
    async getItems(url: string, userId?: number) { try { return await this.tenantService.getLatestItems(url, 6, userId); } catch (error) { throw new BadRequestException('No items found with this company URL'); } }
    async getPublicPageHome(url: string) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(url);
            return company;
        } catch (error) { throw new BadRequestException('No company found with this URL'); }
    }
    async getAudienceStats(url: string) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(url);
            return await this.tenantService.getAudienceStats(company.id);
        } catch (error) { throw new BadRequestException('No audience stats found with this company URL'); }
    }
    async getRecentNewsletterSubscribers(url: string) { try { return await this.tenantService.getRecentNewsletterSubscribers(url, 4); } catch (error) { throw new BadRequestException('No newsletter subscribers found with this company URL'); } }
    async createNewslatter(data: any) {
        try {
            if (!data.email) { throw new BadRequestException('Email is required'); }
            if (!data.company_id) { throw new BadRequestException('Company ID is required'); }
            let companyIdBigInt: bigint;
            if (typeof data.company_id === 'number') { companyIdBigInt = BigInt(data.company_id); }
            else if (typeof data.company_id === 'bigint') { companyIdBigInt = data.company_id; }
            else if (typeof data.company_id === 'string') { companyIdBigInt = BigInt(data.company_id); }
            else { throw new BadRequestException('Invalid company_id type: ' + typeof data.company_id); }
            const processedData = { email: data.email, company_id: companyIdBigInt, created_at: new Date() };
            const existing = await this.prisma.client.newsletter.findFirst({ where: { email: processedData.email, company_id: processedData.company_id } });
            if (existing) { return { success: true, data: existing, message: 'Email already subscribed' }; }
            const result = await this.prisma.client.newsletter.create({ data: processedData, include: { companies: true } });
            const verification = await this.prisma.client.newsletter.findFirst({ where: { email: processedData.email, company_id: processedData.company_id }, include: { companies: true } });
            if (!verification) { throw new Error('Record creation appeared successful but verification failed'); }
            return { success: true, data: result };
        } catch (error) {
            if (error.code === 'P2002') { throw new BadRequestException('Email already subscribed for this company.'); }
            if (error.code === 'P2003') { throw new BadRequestException('Foreign key constraint failed - company may not exist.'); }
            if (error.code === 'P2025') { throw new BadRequestException('Record not found.'); }
            throw new BadRequestException('Failed to create newsletter: ' + error.message);
        }
    }
}