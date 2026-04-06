import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../common/services/tenant.service';

@Injectable()
export class PublicPageTermsConditionsService {
    constructor(private prisma: PrismaService, private tenantService: TenantService) { }
    async getPublicPageTermsConditions(origin: string) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            if (!company) { throw new BadRequestException('Company not found'); }
            let terms = await this.prisma.client.terms_conditions.findFirst({ where: { company_id: company.id }, include: { companies: true } });
            if (!terms) { throw new BadRequestException('Terms and Conditions not found'); }
            return terms;
        } catch (error) { throw new BadRequestException('Failed to load Terms and Conditions: ' + error.message); }
    }
}