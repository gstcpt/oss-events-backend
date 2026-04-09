import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVisitorDto, CreateSessionDto, CreatePageViewDto, CreatePageEventDto, GetVisitorsDto, GetSessionsDto, GetPageViewsDto, GetAudienceStatsDto } from './dto/audiance.dto';
import * as ExcelJS from 'exceljs';
import { REQUEST } from '@nestjs/core';
import { Buffer } from 'buffer';

@Injectable()
export class AudianceService {
    constructor(
        private prisma: PrismaService,
        @Inject(REQUEST) private readonly request: any
    ) { }
    async createVisitor(createVisitorDto: CreateVisitorDto, origin?: string) {
        try {
            // Visitor is global or cross-tenant, no company_id on model
            const existing = await this.prisma.client.visitors.findUnique({ where: { clientId: createVisitorDto.clientId } });
            if (existing) {
                const updated = await this.prisma.client.visitors.update({
                    where: { clientId: createVisitorDto.clientId },
                    data: {
                        userId: createVisitorDto.userId,
                        userAgent: createVisitorDto.userAgent,
                        device: createVisitorDto.device,
                        os: createVisitorDto.os,
                        browser: createVisitorDto.browser,
                        locale: createVisitorDto.locale,
                        ipHash: createVisitorDto.ipHash,
                    }
                });
                return { success: true, data: updated, message: 'Visitor updated successfully' };
            }
            const visitorData = { ...createVisitorDto };
            const visitor = await this.prisma.client.visitors.create({ data: visitorData });
            return { success: true, data: visitor, message: 'Visitor created successfully' };
        } catch (error) { return new BadRequestException('Internal server error while creating visitor'); }
    }
    async createSession(createSessionDto: CreateSessionDto, origin?: string) {
        try {
            // Session is global or cross-tenant, no company_id on model (it is on pageView)
            const existing = await this.prisma.client.sessions.findUnique({ where: { sessionUuid: createSessionDto.sessionUuid } });
            if (existing) {
                return { success: true, data: existing, message: 'Session exists' };
            }
            const sessionData = { ...createSessionDto };
            const session = await this.prisma.client.sessions.create({ data: sessionData });
            return { success: true, data: session, message: 'Session created successfully' };
        } catch (error) { return new BadRequestException('Internal server error while creating session'); }
    }
    async createPageView(createPageViewDto: CreatePageViewDto, origin?: string) {
        try {
            let companyId: number | undefined;
            if (origin) {
                try {
                    const url = new URL(origin);
                    const company = await this.prisma.client.companies.findFirst({ where: { url: url.hostname } });
                    if (company) { companyId = Number(company.id); }
                } catch (urlError) { return new BadRequestException('Invalid origin URL'); }
            }
            const pageViewData = { ...createPageViewDto, company_id: companyId };
            const pageView = await this.prisma.client.page_view.create({ data: pageViewData });
            return { success: true, data: pageView, message: 'Page view created successfully', };
        } catch (error) { return new BadRequestException('Internal server error while creating page view'); }
    }
    async createPageEvent(createPageEventDto: CreatePageEventDto, origin?: string) {
        try {
            let companyId: number | undefined;
            if (origin) {
                try {
                    const url = new URL(origin);
                    const company = await this.prisma.client.companies.findFirst({ where: { url: url.hostname } });
                    if (company) { companyId = Number(company.id); }
                } catch (urlError) { return new BadRequestException('Invalid origin URL'); }
            }
            const pageEventData = { ...createPageEventDto, company_id: companyId };
            const pageEvent = await this.prisma.client.page_event.create({ data: pageEventData });
            return { success: true, data: pageEvent, message: 'Page event created successfully' };
        } catch (error) { return new BadRequestException('Internal server error while creating page event'); }
    }
    async getVisitors(query: GetVisitorsDto, user: any) {
        try {
            const { page = 1, limit = 10, startDate, endDate } = query;
            const skip = (page - 1) * limit;
            const where: any = {};
            let visitorWhere = { ...where };
            if (user?.role && user.role.toLowerCase() === 'admin' && user.company_id) { visitorWhere = { ...visitorWhere, pageViews: { some: { company_id: BigInt(user.company_id) } }, userId: { not: null } }; }
            if (startDate || endDate) {
                where.firstSeen = {};
                if (startDate) where.firstSeen.gte = new Date(startDate);
                if (endDate) where.firstSeen.lte = new Date(endDate);
            }
            const [data, total] = await Promise.all([this.prisma.client.visitors.findMany({ where: visitorWhere, skip, orderBy: { firstSeen: 'desc' }, include: { sessions: true, pageViews: true } }), this.prisma.client.visitors.count({ where: visitorWhere })]);
            return { success: true, data, pagination: { page: parseInt(page.toString()), limit: parseInt(limit.toString()), total, pages: Math.ceil(total / limit) } };
        } catch (error) { return new BadRequestException('Internal server error while fetching visitors'); }
    }
    async getVisitor(id: number, user: any) {
        try {
            const where: any = { id };
            const visitor = await this.prisma.client.visitors.findUnique({ where, include: { sessions: { include: { pageViews: true } }, pageViews: true } });
            if (!visitor) { return new BadRequestException('Visitor not found'); }
            return { success: true, data: visitor };
        } catch (error) { return new BadRequestException('Internal server error while fetching visitor'); }
    }
    async getSessions(query: GetSessionsDto, user: any) {
        try {
            const { visitorId, page = 1, limit = 10, startDate, endDate } = query;
            const skip = (page - 1) * limit;
            const where: any = {};
            let sessionWhere = { ...where };
            if (user?.role && user.role.toLowerCase() === 'admin' && user.company_id) { sessionWhere = { ...sessionWhere, pageViews: { some: { company_id: BigInt(user.company_id) } }, visitor: { userId: { not: null } } }; }
            if (visitorId) where.visitorId = visitorId;
            if (startDate || endDate) {
                where.startedAt = {};
                if (startDate) where.startedAt.gte = new Date(startDate);
                if (endDate) where.startedAt.lte = new Date(endDate);
            }
            const [data, total] = await Promise.all([this.prisma.client.sessions.findMany({ where: sessionWhere, skip, orderBy: { startedAt: 'desc' }, include: { visitor: true, pageViews: true } }), this.prisma.client.sessions.count({ where: sessionWhere })]);
            return { success: true, data, pagination: { page: parseInt(page.toString()), limit: parseInt(limit.toString()), total, pages: Math.ceil(total / limit) } };
        } catch (error) { return new BadRequestException('Internal server error while fetching sessions'); }
    }
    async getSession(id: number, user: any) {
        try {
            const where: any = { id };
            const session = await this.prisma.client.sessions.findUnique({ where, include: { visitor: true, pageViews: { include: { events: true } } } });
            if (!session) { return new BadRequestException('Session not found'); }
            return { success: true, data: session };
        } catch (error) { return new BadRequestException('Internal server error while fetching session'); }
    }
    async getPageViews(query: GetPageViewsDto, user: any) {
        try {
            const { sessionId, resourceType, resourceId, page = 1, limit = 10, startDate, endDate } = query;
            const skip = (page - 1) * limit;
            const where: any = {};
            let pageViewWhere = { ...where };
            if (user?.role && user.role.toLowerCase() === 'admin' && user.company_id) { pageViewWhere = { ...pageViewWhere, company_id: BigInt(user.company_id), visitor: { userId: { not: null } } }; }
            if (sessionId) where.sessionId = sessionId;
            if (resourceType) where.resourceType = resourceType;
            if (resourceId) where.resourceId = resourceId;
            if (startDate || endDate) {
                where.startedAt = {};
                if (startDate) where.startedAt.gte = new Date(startDate);
                if (endDate) where.startedAt.lte = new Date(endDate);
            }
            const [data, total] = await Promise.all([this.prisma.client.page_view.findMany({ where: pageViewWhere, skip, orderBy: { startedAt: 'desc' }, include: { session: { include: { visitor: true } }, events: true } }), this.prisma.client.page_view.count({ where: pageViewWhere })]);
            return { success: true, data, pagination: { page: parseInt(page.toString()), limit: parseInt(limit.toString()), total, pages: Math.ceil(total / limit) } };
        } catch (error) { return new BadRequestException('Internal server error while fetching page views'); }
    }
    async getPageView(id: number, user: any) {
        try {
            const where: any = { id };
            const pageView = await this.prisma.client.page_view.findUnique({ where, include: { session: { include: { visitor: true } }, events: true } });
            if (!pageView) { return new BadRequestException('Page view not found'); }
            return { success: true, data: pageView };
        } catch (error) { return new BadRequestException('Internal server error while fetching page view'); }
    }
    async getPageViewsByResource(resourceType: string, resourceId: number) {
        try {
            const where: any = { resourceType, resourceId };
            const pageViews = await this.prisma.client.page_view.findMany({ where, include: { session: { include: { visitor: true } }, events: true } });
            return { success: true, data: pageViews };
        } catch (error) { return new BadRequestException('Internal server error while fetching page views'); }
    }
    async getAudienceStats(query: GetAudienceStatsDto, user: any) {
        try {
            const { startDate, endDate, resourceType, resourceId } = query;
            const where: any = {};
            let visitorWhere: any = {};
            let sessionWhere: any = {};
            let pageViewWhere: any = {};

            if (user?.role && user.role.toLowerCase() === 'admin' && user.company_id) {
                const companyIdFilter = { company_id: BigInt(user.company_id) };
                visitorWhere = { pageViews: { some: companyIdFilter }, userId: { not: null } };
                sessionWhere = { pageViews: { some: companyIdFilter }, visitor: { userId: { not: null } } };
                pageViewWhere = { ...companyIdFilter, visitor: { userId: { not: null } } };
            }

            if (startDate || endDate) {
                const dateFilter: any = {};
                if (startDate) dateFilter.gte = new Date(startDate);
                if (endDate) dateFilter.lte = new Date(endDate);

                // Use startedAt for sessions and page views
                sessionWhere.startedAt = dateFilter;
                pageViewWhere.startedAt = dateFilter;
                // Use firstSeen for visitors
                visitorWhere.firstSeen = dateFilter;
            }

            if (resourceType) pageViewWhere.resourceType = resourceType;
            if (resourceId) pageViewWhere.resourceId = Number(resourceId);

            const [totalVisitors, activeSessions, pageViews, totalBounces, sessionDurationData, topPages, topResources, deviceStats, browserStats] = await Promise.all([
                this.prisma.client.visitors.count({ where: visitorWhere }),
                this.prisma.client.sessions.count({ where: { ...sessionWhere, endedAt: null } }),
                this.prisma.client.page_view.count({ where: pageViewWhere }),
                this.prisma.client.page_view.count({ where: { ...pageViewWhere, isBounce: true } }),
                this.prisma.client.sessions.aggregate({ where: sessionWhere, _avg: { durationMs: true } }),
                this.prisma.client.page_view.groupBy({ by: ['path'], where: pageViewWhere, _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
                this.prisma.client.page_view.groupBy({ by: ['resourceType', 'resourceId'], where: pageViewWhere, _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
                this.prisma.client.visitors.groupBy({ by: ['device'], where: visitorWhere, _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
                this.prisma.client.visitors.groupBy({ by: ['browser'], where: visitorWhere, _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
            ]);

            const bounceRate = pageViews > 0 ? (totalBounces / pageViews) * 100 : 0;
            const avgDuration = sessionDurationData._avg.durationMs || 0;

            return {
                success: true,
                data: {
                    totalVisitors,
                    activeSessions,
                    pageViews,
                    bounceRate: parseFloat(bounceRate.toFixed(2)),
                    avgSessionDuration: parseFloat((avgDuration / 1000).toFixed(2)), // in seconds
                    topPages: topPages.map(page => ({ path: page.path, views: page._count.id })),
                    topResources: topResources.filter(resource => resource.resourceType && resource.resourceId).map(resource => ({ type: resource.resourceType, id: resource.resourceId, views: resource._count.id })),
                    deviceStats: deviceStats.filter(stat => stat.device).map(stat => ({ device: stat.device, count: stat._count.id })),
                    browserStats: browserStats.filter(stat => stat.browser).map(stat => ({ browser: stat.browser, count: stat._count.id })),
                },
            };
        } catch (error) {
            return new BadRequestException('Internal server error while fetching audience statistics');
        }
    }

    async getDailyAggregates(query: GetAudienceStatsDto, user: any) {
        try {
            const { startDate, endDate, resourceType, resourceId } = query;
            let pageViewWhere: any = {};
            if (user?.role && user.role.toLowerCase() === 'admin' && user.company_id) {
                pageViewWhere = { ...pageViewWhere, company_id: BigInt(user.company_id), visitor: { userId: { not: null } } };
            }
            if (startDate || endDate) {
                pageViewWhere.startedAt = {};
                if (startDate) pageViewWhere.startedAt.gte = new Date(startDate);
                if (endDate) pageViewWhere.startedAt.lte = new Date(endDate);
            }
            if (resourceType) pageViewWhere.resourceType = resourceType;
            if (resourceId) pageViewWhere.resourceId = resourceId;
            const [views, interactions, comments] = await Promise.all([
                this.prisma.client.page_view.findMany({
                    where: pageViewWhere,
                    select: { startedAt: true, visitorId: true, interactions_count: true, durationMs: true }
                }),
                this.prisma.client.new_interactions.findMany({
                    where: {
                        ...(user?.role && user.role.toLowerCase() === 'admin' && user.company_id ? { company_id: BigInt(user.company_id) } : {}),
                        ...(startDate || endDate ? { created_at: { ...(startDate ? { gte: new Date(startDate) } : {}), ...(endDate ? { lte: new Date(endDate) } : {}) } } : {}),
                        ...(resourceType ? { target_type: resourceType === 'items' ? 'ITEM' : (resourceType === 'blogs' ? 'BLOG' : resourceType.toUpperCase()) } : {}),
                        ...(resourceId ? { target_id: BigInt(resourceId) } : {})
                    },
                    select: { created_at: true }
                }),
                this.prisma.client.comments.findMany({
                    where: {
                        ...(user?.role && user.role.toLowerCase() === 'admin' && user.company_id ? { company_id: BigInt(user.company_id) } : {}),
                        ...(startDate || endDate ? { created_at: { ...(startDate ? { gte: new Date(startDate) } : {}), ...(endDate ? { lte: new Date(endDate) } : {}) } } : {}),
                        ...(resourceType ? { target_type: resourceType === 'items' ? 'ITEM' : (resourceType === 'blogs' ? 'BLOG' : resourceType.toUpperCase()) } : {}),
                        ...(resourceId ? { target_id: BigInt(resourceId) } : {}),
                        is_deleted: false
                    },
                    select: { created_at: true }
                })
            ]);

            const map: Record<string, { day: string; views: number; uniques: number; totalDurationMs: number; interactions: number; visitorSet: Set<number> }> = {};

            // Process Views
            views.forEach(pv => {
                const d = pv.startedAt ? new Date(pv.startedAt) : new Date();
                const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
                if (!map[key]) { map[key] = { day: key, views: 0, uniques: 0, totalDurationMs: 0, interactions: 0, visitorSet: new Set<number>() }; }
                const bucket = map[key];
                bucket.views += 1;
                if (pv.visitorId) bucket.visitorSet.add(Number(pv.visitorId));
                bucket.totalDurationMs += Number(pv.durationMs || 0);
            });

            // Process Interactions
            interactions.forEach(i => {
                const d = new Date(i.created_at);
                const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
                if (!map[key]) { map[key] = { day: key, views: 0, uniques: 0, totalDurationMs: 0, interactions: 0, visitorSet: new Set<number>() }; }
                map[key].interactions += 1;
            });

            // Process Comments as Interactions
            comments.forEach(c => {
                const d = new Date(c.created_at);
                const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
                if (!map[key]) { map[key] = { day: key, views: 0, uniques: 0, totalDurationMs: 0, interactions: 0, visitorSet: new Set<number>() }; }
                map[key].interactions += 1;
            });

            const data = Object.values(map).sort((a, b) => a.day.localeCompare(b.day)).map(b => ({
                id: 0,
                day: new Date(b.day),
                resourceType: resourceType,
                resourceId: resourceId,
                views: b.views,
                uniques: b.visitorSet.size,
                totalDurationMs: BigInt(b.totalDurationMs),
                avgDurationMs: b.views ? (b.totalDurationMs / b.views) : 0,
                interactions: b.interactions,
                createdAt: new Date()
            }));
            return { success: true, data };
        } catch (error) { return new BadRequestException('Internal server error while fetching daily aggregates'); }
    }

    async exportAudienceData(type: string, startDate: string, endDate: string, user: any): Promise<{ buffer: any, filename: string }> {
        try {
            let data: any[] = [];
            let columns: { header: string, key: string, width?: number }[] = [];
            let title = '';
            let companyName = '';
            let userMap: Record<number, any> = {};
            if (type === 'visitors') {
                let visitorWhere: any = { ...(startDate ? { firstSeen: { gte: new Date(startDate) } } : {}), ...(endDate ? { firstSeen: { lte: new Date(endDate) } } : {}) };
                if (user?.role && user.role.toLowerCase() === 'admin' && user.company_id) { visitorWhere = { ...visitorWhere, pageViews: { some: { company_id: BigInt(user.company_id) } }, userId: { not: null } }; }
                data = await this.prisma.client.visitors.findMany({ where: visitorWhere });
                columns = [
                    { header: 'ID', key: 'id' },
                    { header: 'Client ID', key: 'clientId' },
                    { header: 'User ID', key: 'userId' },
                    { header: 'First Seen', key: 'firstSeen' },
                    { header: 'Last Seen', key: 'lastSeen' },
                    { header: 'Device', key: 'device' },
                    { header: 'OS', key: 'os' },
                    { header: 'Browser', key: 'browser' },
                    { header: 'Locale', key: 'locale' },
                ];
                if (user.role === 'root') { columns.push({ header: 'Company', key: 'company' }); }
                title = 'Visitors';
                const userIds = Array.from(new Set(data.map(v => v.userId).filter(Boolean)));
                if (userIds.length) {
                    const users = await this.prisma.client.users.findMany({ where: { id: { in: userIds } }, include: { companies_user: true } });
                    userMap = Object.fromEntries(users.map(u => [u.id, u]));
                }
            } else if (type === 'sessions') {
                let sessionWhere: any = { ...(startDate ? { startedAt: { gte: new Date(startDate) } } : {}), ...(endDate ? { startedAt: { lte: new Date(endDate) } } : {}) };
                if (user?.role && user.role.toLowerCase() === 'admin' && user.company_id) { sessionWhere = { ...sessionWhere, pageViews: { some: { company_id: BigInt(user.company_id) } }, visitor: { userId: { not: null } } }; }
                data = await this.prisma.client.sessions.findMany({ where: sessionWhere, include: { visitor: true } });
                columns = [
                    { header: 'ID', key: 'id' },
                    { header: 'Session UUID', key: 'sessionUuid' },
                    { header: 'Visitor ID', key: 'visitorId' },
                    { header: 'Started At', key: 'startedAt' },
                    { header: 'Ended At', key: 'endedAt' },
                    { header: 'Duration (ms)', key: 'durationMs' },
                    { header: 'Entry URL', key: 'entryUrl' },
                    { header: 'Entry Resource', key: 'entryResource' },
                    { header: 'Entry Resource ID', key: 'entryResourceId' },
                ];
                if (user.role === 'root') { columns.push({ header: 'Company', key: 'company' }); }
                title = 'Sessions';
                const userIds = Array.from(new Set(data.map(s => s.visitor?.userId).filter(Boolean)));
                if (userIds.length) {
                    const users = await this.prisma.client.users.findMany({ where: { id: { in: userIds } }, include: { companies_user: true } });
                    userMap = Object.fromEntries(users.map(u => [u.id, u]));
                }
            } else if (type === 'page-views') {
                let pageViewWhere: any = { ...(startDate ? { startedAt: { gte: new Date(startDate) } } : {}), ...(endDate ? { startedAt: { lte: new Date(endDate) } } : {}) };
                if (user?.role && user.role.toLowerCase() === 'admin' && user.company_id) { pageViewWhere = { ...pageViewWhere, company_id: BigInt(user.company_id), visitor: { userId: { not: null } } }; }
                data = await this.prisma.client.page_view.findMany({ where: pageViewWhere, include: { session: { include: { visitor: true } } } });
                columns = [
                    { header: 'ID', key: 'id' },
                    { header: 'Session ID', key: 'sessionId' },
                    { header: 'Path', key: 'path' },
                    { header: 'Started At', key: 'startedAt' },
                    { header: 'Duration (ms)', key: 'durationMs' },
                    { header: 'Is Bounce', key: 'isBounce' },
                    { header: 'Interactions', key: 'interactions' },
                    { header: 'Resource Type', key: 'resourceType' },
                    { header: 'Resource ID', key: 'resourceId' },
                ];
                if (user.role === 'root') { columns.push({ header: 'Company', key: 'company' }); }
                title = 'Page Views';
                const userIds = Array.from(new Set(data.map(pv => pv.session?.visitor?.userId).filter(Boolean)));
                if (userIds.length) {
                    const users = await this.prisma.client.users.findMany({ where: { id: { in: userIds } }, include: { companies_user: true } });
                    userMap = Object.fromEntries(users.map(u => [u.id, u]));
                }
            }
            if (user.company_id) {
                const company = await this.prisma.client.companies.findUnique({ where: { id: user.company_id } });
                if (company) { companyName = company.title; }
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(title);
            const now = new Date();
            const reportTitle = `${companyName} ${title} Report`;
            const dateRange = startDate && endDate ? `Start Date: ${new Date(startDate).toLocaleDateString()} - End Date: ${new Date(endDate).toLocaleDateString()}` : 'All Time';
            const titleRow = worksheet.addRow([`${reportTitle} - Generated on: ${now.toLocaleDateString()}`]);
            titleRow.font = { size: 18, bold: true };
            titleRow.alignment = { horizontal: 'center' };
            worksheet.mergeCells(1, 1, 1, columns.length);
            const dateRow = worksheet.addRow([dateRange]);
            dateRow.font = { size: 12 };
            dateRow.alignment = { horizontal: 'center' };
            worksheet.mergeCells(2, 1, 2, columns.length);
            worksheet.addRow([]);
            const headerRow = worksheet.addRow(columns.map(c => c.header));
            headerRow.eachCell({ includeEmpty: true }, cell => {
                cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEA580C' } };
                cell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } }; // White text
            });
            data.forEach(item => {
                const rowValues = columns.map(col => {
                    if (col.key === 'company') {
                        const userId = item.userId || item.visitor?.userId || item.session?.visitor?.userId;
                        const userDetail = userMap[userId];
                        return userDetail?.companies_user?.name || '';
                    }
                    return item[col.key];
                });
                const dataRow = worksheet.addRow(rowValues);
                dataRow.eachCell({ includeEmpty: true }, cell => {
                    cell.font = { size: 12 };
                    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                });
            });
            for (let i = 0; i < columns.length; i++) {
                const column = worksheet.getColumn(i + 1);
                let maxLength = columns[i].header.length;
                for (let j = 5; j <= worksheet.rowCount; j++) {
                    const cell = worksheet.getRow(j).getCell(i + 1);
                    if (cell.value) {
                        const cellLength = cell.value.toString().length;
                        if (cellLength > maxLength) { maxLength = cellLength; }
                    }
                }
                column.width = maxLength + 3;
            }
            const filename = `${title.replace(/\s/g, '_')}_${now.toISOString()}.xlsx`;
            const buffer = await workbook.xlsx.writeBuffer();
            return { buffer, filename };
        } catch (error) { throw new BadRequestException('Failed to export data'); }
    }
}