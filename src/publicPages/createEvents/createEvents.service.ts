import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PublicPageCreateEventsService {
    constructor(private prisma: PrismaService) { }
    async getPublicPageCreateEvents(url: string) { try { return await this.prisma.client.companies.findFirst({ where: { url: url }, }); } catch (error) { throw new BadRequestException('No company found with this URL'); } }
}