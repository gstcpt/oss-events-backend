import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../common/services/tenant.service';

@Injectable()
export class PublicPageFAQService {
    constructor(private prisma: PrismaService, private tenantService: TenantService) { }
    async getPublicPageFAQ(origin: string) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            if (!company) { throw new BadRequestException('Company not found'); }
            let faqs = await this.prisma.client.faq.findMany({ where: { company_id: company.id }, include: { faq_sections: true, companies: true }, orderBy: { faq_order: 'asc' } });
            if (!faqs) { throw new BadRequestException('FAQs not found'); }
            return faqs;
        }
        catch (error) { throw new BadRequestException('Failed to load FAQs: ' + error.message); }
    }
}