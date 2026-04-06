import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../common/services/tenant.service';

@Injectable()
export class PublicPageContactService {
    private readonly logger = new Logger(PublicPageContactService.name);

    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService
    ) { }

    async getPublicPageContact(origin: string) {
        try {
            const company = await this.tenantService.getCompanyByOrigin(origin);
            
            return await this.prisma.client.companies.findUnique({
                where: { id: company.id },
                include: {
                    countries: true,
                    governorates: true,
                    municipalities: true,
                    admin: {
                        select: {
                            id: true,
                            firstname: true,
                            lastname: true,
                            email: true,
                            phone: true,
                            avatar: true
                        }
                    }
                }
            });
        } catch (error) {
            this.logger.error(`Error fetching contact for origin ${origin}:`, error.stack);
            throw new BadRequestException('No company found for this request');
        }
    }
}