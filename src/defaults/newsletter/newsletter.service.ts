import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { UpdateNewsletterDto } from './dto/update-newsletter.dto';

@Injectable()
export class NewsletterService {
    constructor(private prisma: PrismaService) { }
    async findAll(query: any, user: any) {
        try {
            const { page = 1, limit = 10, search } = query;
            const pageNum = parseInt(page.toString());
            const limitNum = parseInt(limit.toString());
            const skip = (pageNum - 1) * limitNum;
            const where: any = {};
            if (user.role && user.role.toLowerCase() === 'admin' && user.company_id) { where.company_id = user.company_id; }
            if (search) { where.email = { contains: search, mode: 'insensitive' }; }
            const [data, total] = await Promise.all([this.prisma.client.newsletter.findMany({ where, skip: skip, take: limitNum, orderBy: { id: 'desc' }, include: { companies: true } }), this.prisma.client.newsletter.count({ where })]);
            return { success: true, data, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } };
        } catch (error) { return new BadRequestException('Internal server error while fetching newsletter subscriptions'); }
    }
    async findOne(id: bigint, user: any) {
        try {
            const where: any = { id };
            if (user.role && user.role.toLowerCase() === 'admin' && user.company_id) { where.company_id = user.company_id; }
            const newsletter = await this.prisma.client.newsletter.findUnique({ where, include: { companies: true } });
            if (!newsletter) { return { success: false, error: 'Newsletter not found' }; }
            return { success: true, data: newsletter };
        } catch (error) { return { success: false, error: 'Internal server error while fetching newsletter subscription' }; }
    }
    async create(createNewsletterDto: CreateNewsletterDto, origin?: string) {
        try {
            let companyId: bigint | undefined;
            if (origin) {
                try {
                    const url = new URL(origin);
                    const company = await this.prisma.client.companies.findFirst({ where: { url: url.hostname } });
                    if (company) { companyId = company.id; }
                } catch (error) { return new BadRequestException('Invalid origin URL'); }
            }
            if (createNewsletterDto.company_id !== undefined && createNewsletterDto.company_id !== null) { companyId = BigInt(createNewsletterDto.company_id); }
            const newsletterData = { email: createNewsletterDto.email, company_id: companyId, created_at: new Date() };
            const existingEmail = await this.prisma.client.newsletter.findFirst({ where: { email: createNewsletterDto.email, company_id: companyId } });
            if (existingEmail) { return { success: true, data: existingEmail, message: 'Email already subscribed' }; }
            const newsletter = await this.prisma.client.newsletter.create({ data: newsletterData, include: { companies: true } });
            return { success: true, data: newsletter };
        } catch (error) { return new BadRequestException('Internal server error while creating newsletter subscription'); }
    }
    async update(id: bigint, updateNewsletterDto: UpdateNewsletterDto, user: any) {
        try {
            const existingNewsletter = await this.prisma.client.newsletter.findUnique({ where: { id } });
            if (!existingNewsletter) { return { success: false, error: 'Newsletter not found' }; }
            if (user.role && user.role.toLowerCase() === 'admin' && user.company_id) { if (existingNewsletter.company_id !== user.company_id) { return { success: false, error: 'Unauthorized access to this newsletter' }; } }
            let updateData: any = {};
            if (updateNewsletterDto.email !== undefined) { updateData.email = updateNewsletterDto.email; }
            if (updateNewsletterDto.company_id !== undefined && updateNewsletterDto.company_id !== null) { try { updateData.company_id = BigInt(updateNewsletterDto.company_id); } catch (conversionError) { return { success: false, error: 'Invalid company ID format' }; } }
            else if (updateNewsletterDto.company_id === null) { updateData.company_id = null; }
            if (updateNewsletterDto.email !== undefined || updateNewsletterDto.company_id !== undefined) {
                const existingEmail = await this.prisma.client.newsletter.findFirst({
                    where: { email: updateNewsletterDto.email || existingNewsletter.email, company_id: updateNewsletterDto.company_id !== undefined ? updateNewsletterDto.company_id : existingNewsletter.company_id, NOT: { id: id } }
                });
                if (existingEmail) { return { success: false, error: 'Email already subscribed for this company.' }; }
            }
            const newsletter = await this.prisma.client.newsletter.update({ where: { id }, data: updateData, include: { companies: true } });
            return { success: true, data: newsletter };
        } catch (error) { return { success: false, error: `Internal server error while updating newsletter subscription: ${error.message}` }; }
    }
    async remove(id: bigint, user: any) {
        try {
            const existingNewsletter = await this.prisma.client.newsletter.findUnique({ where: { id } });
            if (!existingNewsletter) { return { success: false, error: 'Newsletter not found' }; }
            if (user.role && user.role.toLowerCase() === 'admin' && user.company_id) { if (existingNewsletter.company_id !== user.company_id) { return { success: false, error: 'Unauthorized access to this newsletter' }; } }
            await this.prisma.client.newsletter.delete({ where: { id } });
            return { success: true, message: 'Newsletter subscription deleted successfully' };
        } catch (error) { return { success: false, error: 'Internal server error while deleting newsletter subscription' }; }
    }
    async getStats(user: any) {
        try {
            const where: any = {};
            if (user.role && user.role.toLowerCase() === 'admin' && user.company_id) { where.company_id = user.company_id; }
            const totalSubscribers = await this.prisma.client.newsletter.count({ where });
            const thisMonth = await this.prisma.client.newsletter.count({ where: { created_at: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } });
            const thisWeek = await this.prisma.client.newsletter.count({ where: { created_at: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) } } });
            const today = await this.prisma.client.newsletter.count({ where: { created_at: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } });
            return { success: true, data: { totalSubscribers, thisMonth, thisWeek, today } };
        } catch (error) { return { success: false, error: 'Internal server error while fetching newsletter statistics' }; }
    }
    async exportToCsv(query: any, user: any) {
        try {
            const where: any = {};
            if (user.role && user.role.toLowerCase() === 'admin' && user.company_id) { where.company_id = user.company_id; }
            if (query.search) { where.email = { contains: query.search, mode: 'insensitive' }; }
            const newsletters = await this.prisma.client.newsletter.findMany({ where, orderBy: { id: 'desc' }, include: { companies: true } });
            const date = new Date().toISOString().split('T')[0];
            const time = new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, ':');
            let titleHeader = ['', 'OSS-Events - Newsletter Subscribers', ''];
            let dateHeader = ['', `Created at: ${date} - ${time}`, ''];
            let emptyHeader = ['', '', ''];
            let tableHeader = ['ID', 'Email', 'Subscribed At'];
            if (user.role && user.role.toLowerCase() === 'root') { tableHeader.push('Company'); }
            const rows = newsletters.map(n => [
                n.id.toString(),
                `"${n.email ? n.email.replace(/"/g, '""') : ''}"`,
                `"${n.created_at ? new Date(n.created_at).toISOString() : ''}"`,
                ...(user.role && user.role.toLowerCase() === 'root' ? [`"${n.companies?.title ? n.companies.title.replace(/"/g, '""') : ''}"`] : [])
            ]);
            const csvData = [titleHeader.join(','), dateHeader.join(','), emptyHeader.join(','), tableHeader.join(','), ...rows.map(r => r.join(','))].join('\n');
            return { success: true, csvData };
        } catch (error) { return { success: false, error: 'Internal server error while exporting newsletter data' }; }
    }
}