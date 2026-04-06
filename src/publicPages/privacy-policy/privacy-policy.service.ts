import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../common/services/tenant.service';

@Injectable()
export class PublicPagePrivacyPolicyService {
    constructor(private prisma: PrismaService, private tenantService: TenantService) { }
    async getPublicPagePrivacyPolicy(origin: string) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            if (!company) { throw new BadRequestException('Company not found'); }
            let policy = await this.prisma.client.privacy_policy.findFirst({ where: { company_id: company.id }, include: { companies: true } });
            if (!policy) { throw new BadRequestException('Privacy Policy not found'); }
            return policy;
        }
        catch (error) { throw new BadRequestException('Failed to load Privacy Policy: ' + error.message); }
    }
}