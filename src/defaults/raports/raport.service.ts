import { Injectable, Scope, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as path from 'path';

@Injectable({ scope: Scope.REQUEST })
export class RaportService {
    constructor(private prisma: PrismaService) { }

    /* ---------- Helpers ---------- */

    private async ensureRole(currentUser: any) {
        if (!currentUser.role && currentUser.role_id) {
            const role = await this.prisma.client.roles.findUnique({ where: { id: currentUser.role_id } });
            currentUser.role = role?.title;
        }
        return currentUser.role;
    }

    private handleError(msg: string, error: unknown): never {
        if (error instanceof BadRequestException) throw error;
        throw new BadRequestException(msg);
    }

    private fmtDate(d?: Date) { return d ? d.toISOString().split('T')[0] : ''; }

    private toNumber(value?: any) { try { return value?.toNumber ? value.toNumber() : Number(value ?? 0); } catch { return Number(value ?? 0); } }

    /**
     * Generic helper to call prisma.findMany with role-based restriction.
     * - model: prisma model name (string)
     * - opts.include: prisma include object
     * - opts.companyField: name of the field to restrict by company (eg: 'company_id' or 'id')
     * If currentUser.role === 'Root' -> no restriction
     * If currentUser.role === 'Admin' -> restrict by company id when companyField provided
     */
    private async findManyByRole(model: string, currentUser: any, opts?: { include?: any; companyField?: string; where?: any }) {
        try {
            await this.ensureRole(currentUser);
            const role = currentUser.role;
            const where = { ...(opts?.where ?? {}) };
            if (role === 'Admin' && opts?.companyField && currentUser.company_id) { where[opts.companyField] = BigInt(currentUser.company_id); } else if (role !== 'Root' && role !== 'Admin') { return []; }
            const modelClient = (this.prisma.client as any)[model];
            if (!modelClient || !modelClient.findMany) { throw new BadRequestException(`Model ${model} not found on prisma client`); }
            return await modelClient.findMany({ where, include: opts?.include, orderBy: { id: 'desc' } });
        } catch (error) { this.handleError(`Error fetching ${model}`, error); }
    }

    /* ---------- Public API ---------- */

    async getCompanies(currentUser: any) {
        try {
            const companies = await this.findManyByRole('companies', currentUser, { include: { users_companies: true, events: true }, companyField: 'id' });
            const data = (companies || []).map((c: any) => ({
                id: Number(c.id),
                name: c.title,
                industry: c.domain || 'N/A',
                employees_count: c.users_companies?.length || 0,
                events_hosted: c.events?.length || 0,
                registration_date: this.fmtDate(c.date_foundation),
            }));
            return { data };
        } catch (error) { this.handleError('Error finding companies', error); }
    }

    async getCompaniesStats(currentUser: any) {
        try {
            const companies = await this.findManyByRole('companies', currentUser, { include: { events: true }, companyField: 'id' });
            const total = companies.length;
            const mostActive = companies.reduce((prev: any, current: any) => (prev.events?.length || 0) > (current.events?.length || 0) ? prev : current);
            return { total, mostActive: { name: mostActive?.title || 'N/A', events: mostActive?.events?.length || 0 } };
        } catch (error) { this.handleError('Error getting companies stats', error); }
    }

    async getSubscriptions(currentUser: any) {
        try {
            const subs = await this.findManyByRole('subscriptions', currentUser, { include: { packs: true, companies: true }, companyField: 'company_id' });
            const data = (subs || []).map((s: any) => {
                const now = new Date();
                return {
                    id: Number(s.id),
                    user_name: s.companies?.title || '',
                    plan_name: s.packs?.title || '',
                    status: s.end_date && s.end_date > now ? 'active' : 'expired',
                    start_date: this.fmtDate(s.start_date),
                    end_date: this.fmtDate(s.end_date),
                    amount: this.toNumber(s.packs?.price)
                };
            });
            return { data };
        } catch (error) { this.handleError('Error finding subscriptions', error); }
    }

    async getSubscriptionsStats(currentUser: any) {
        try {
            const subs = await this.findManyByRole('subscriptions', currentUser, { include: { packs: true }, companyField: 'company_id' });
            const subscriptions = subs || [];
            const now = new Date();
            const total = subscriptions.length;
            const active = subscriptions.filter((s: any) => s.end_date && s.end_date > now).length;
            const expired = total - active;
            const totalRevenue = subscriptions.reduce((acc: number, s: any) => acc + this.toNumber(s.packs?.price), 0);
            return { total, active, expired, totalRevenue };
        } catch (error) { this.handleError('Error getting subscriptions stats', error); }
    }

    async getUsers(currentUser: any) {
        try {
            const users = await this.findManyByRole('users', currentUser, { include: { roles: true, companies_user: true }, companyField: 'company_id' });
            const userIds = users.map((u: any) => u.id);
            const logs = await this.prisma.client.logs.findMany({ where: { entity: 'users', row_id: { in: userIds }, action: 'create' }, orderBy: { id: 'desc' } });
            const logsMap = new Map<any, Date>(logs.map((l: any) => [l.row_id, l.created_at]));
            const data = (users || []).map((u: any) => ({
                id: Number(u.id),
                name: [u.firstname, u.midname, u.lastname].filter(Boolean).join(' '),
                firstname: u.firstname,
                middlename: u.middlename,
                lastname: u.lastname,
                username: u.username,
                email: u.email,
                phone: u.phone,
                email_verified: u.email_verified,
                company: u.companies_user?.title || '',
                role: u.roles?.title || '',
                status: u.status,
                created_at: this.fmtDate(logsMap.get(u.id))
            }));
            return { data };
        } catch (error) { this.handleError('Error finding users', error); }
    }

    async getUsersStats(currentUser: any) {
        try {
            const users = await this.findManyByRole('users', currentUser, { include: { roles: true }, companyField: 'company_id' });
            const u = users || [];
            const total = u.length;
            const active = u.filter((x: any) => x.status === 1).length;
            const inactive = u.filter((x: any) => x.status !== 1).length;

            const roleCounts: Record<string, number> = {};
            u.forEach((user: any) => {
                const role = user.roles?.title || 'Unknown';
                if (!roleCounts[role]) {
                    roleCounts[role] = 0;
                }
                roleCounts[role]++;
            });

            return { total, active, inactive, ...roleCounts };
        } catch (error) { this.handleError('Error getting users stats', error); }
    }

    private async getUsersByRoleTitle(roleTitle: string, currentUser: any) {
        try {
            const role = await this.prisma.client.roles.findFirst({ where: { title: roleTitle } });
            if (!role) throw new BadRequestException(`${roleTitle} role not found`);
            const users = await this.findManyByRole('users', currentUser, { where: { role_id: role.id }, include: { roles: true, companies_user: true }, companyField: 'company_id' });
            return users || [];
        } catch (error) { this.handleError(`Error finding ${roleTitle.toLowerCase()}s`, error); }
    }

    async getAdmins(currentUser: any) {
        try {
            const admins = await this.getUsersByRoleTitle('Admin', currentUser);
            const adminIds = admins.map((a: any) => a.id);
            const logs = await this.prisma.client.logs.findMany({ where: { entity: 'users', row_id: { in: adminIds }, action: 'create' }, orderBy: { id: 'desc' } });
            const logsMap = new Map<any, Date>(logs.map((l: any) => [l.row_id, l.created_at]));
            const data = admins.map((a: any) => ({
                id: Number(a.id),
                name: [a.firstname, a.midname, a.lastname].filter(Boolean).join(' '),
                firstname: a.firstname,
                middlename: a.middlename,
                lastname: a.lastname,
                email: a.email,
                username: a.username,
                phone: a.phone,
                email_verified: a.email_verified,
                status: a.status,
                company: a.companies_user?.title || '',
                created_at: this.fmtDate(logsMap.get(a.id))
            }));
            return { data };
        } catch (error) { this.handleError('Error finding admins', error); }
    }

    async getProviders(currentUser: any) {
        try {
            const providers = await this.getUsersByRoleTitle('Provider', currentUser);
            const providerIds = providers.map((p: any) => p.id);
            const logs = await this.prisma.client.logs.findMany({ where: { entity: 'users', row_id: { in: providerIds }, action: 'create' }, orderBy: { id: 'desc' } });
            const logsMap = new Map<any, Date>(logs.map((l: any) => [l.row_id, l.created_at]));
            const items = await this.prisma.client.items.groupBy({ by: ['provider_id'], _count: { id: true }, where: { provider_id: { in: providerIds } } });
            const itemsMap = new Map(items.map((i: any) => [i.provider_id, i._count.id]));
            const data = providers.map((p: any) => ({
                id: Number(p.id),
                name: [p.firstname, p.midname, p.lastname].filter(Boolean).join(' '),
                firstname: p.firstname,
                middlename: p.middlename,
                lastname: p.lastname,
                email: p.email,
                username: p.username,
                phone: p.phone,
                email_verified: p.email_verified,
                status: p.status,
                company: p.companies_user?.title || '',
                joined_date: this.fmtDate(logsMap.get(p.id)),
                events_provided: itemsMap.get(p.id) || 0
            }));
            return { data };
        } catch (error) { this.handleError('Error finding providers', error); }
    }

    async getClients(currentUser: any) {
        try {
            const clients = await this.getUsersByRoleTitle('Client', currentUser);
            const clientIds = clients.map((c: any) => c.id);
            const logs = await this.prisma.client.logs.findMany({ where: { entity: 'users', row_id: { in: clientIds }, action: 'create' }, select: { row_id: true, created_at: true }, orderBy: { id: 'desc' } });
            const logsMap = new Map<any, Date>(logs.filter(l => l.created_at).map(log => [log.row_id, log.created_at as Date]));
            const events = await this.prisma.client.events.groupBy({ by: ['client_id'], _count: { id: true }, where: { client_id: { in: clientIds } } });
            const eventsMap = new Map(events.map(e => [e.client_id, e._count.id]));
            const data = clients.map((c: any) => ({
                id: Number(c.id),
                name: [c.firstname, c.midname, c.lastname].filter(Boolean).join(' '),
                firstname: c.firstname,
                middlename: c.middlename,
                lastname: c.lastname,
                email: c.email,
                username: c.username,
                phone: c.phone,
                status: c.status,
                email_verified: c.email_verified,
                company: c.companies_user?.title || '',
                registration_date: this.fmtDate(logsMap.get(c.id)),
                events_created: eventsMap.get(c.id) || 0
            }));
            return { data };
        } catch (error) { this.handleError('Error finding clients', error); }
    }

    async getTags(currentUser: any) {
        try {
            const tags = await this.findManyByRole('tags', currentUser, { include: { category_tags: true, companies: true }, companyField: 'company_id' });
            const tagIds = tags.map((c: any) => c.id);
            const logs = await this.prisma.client.logs.findMany({ where: { entity: 'tags', row_id: { in: tagIds }, action: 'create' }, select: { row_id: true, created_at: true }, orderBy: { id: 'desc' } });
            const logsMap = new Map<any, Date>(logs.map((l: any) => [l.row_id, l.created_at]));
            const data = (tags || []).map((tag: any) => ({ id: Number(tag.id), name: tag.title, color: tag.type || '', company: tag.companies?.title || '', usage_count: tag.category_tags.length, created_at: this.fmtDate(logsMap.get(tag.id)) }));
            return { data };
        } catch (error) { this.handleError('Error finding tags', error); }
    }

    async getCategories(currentUser: any) {
        try {
            await this.ensureRole(currentUser);
            const role = currentUser.role;
            const where: any = {};
            if (role === 'Admin' && currentUser.company_id) { where.company_id = BigInt(currentUser.company_id); } else if (role !== 'Root' && role !== 'Admin') { return { data: [] }; }
            const categories = await this.prisma.client.categories.findMany({ where, include: { item_category: { select: { items: { select: { event_lines: { select: { event_id: true } } } } } } }, orderBy: { id: 'desc' } });
            const categoryIds = categories.map((c: any) => c.id);
            const logs = await this.prisma.client.logs.findMany({ where: { entity: 'categories', row_id: { in: categoryIds }, action: 'create' }, orderBy: { id: 'desc' } });
            const logsMap = new Map<any, Date>(logs.map((l: any) => [l.row_id, l.created_at]));
            const data = categories.map((cat: any) => {
                const eventIds = new Set<bigint>();
                cat.item_category.forEach((ic: any) => { if (ic.items && ic.items.event_lines) { ic.items.event_lines.forEach((el: any) => { if (el.event_id) { eventIds.add(el.event_id); } }); } });
                return {
                    id: Number(cat.id),
                    name: cat.title,
                    image: cat.image || '',
                    events_count: eventIds.size,
                    created_at: this.fmtDate(logsMap.get(cat.id)),
                };
            });
            data.sort((a, b) => b.events_count - a.events_count);
            return { data };
        } catch (error) { this.handleError('Error finding categories', error); }
    }

    async getItems(currentUser: any) {
        try {
            const items = await this.findManyByRole('items', currentUser, { companyField: 'company_id', include: { item_category: { include: { categories: true } }, event_lines: true } });
            const itemIds = items.map((i: any) => i.id);
            const logs = await this.prisma.client.logs.findMany({ where: { entity: 'items', row_id: { in: itemIds }, action: 'create' }, orderBy: { id: 'desc' } });
            const logsMap = new Map<any, Date>(logs.map((l: any) => [l.row_id, l.created_at]));
            const companies = await this.findManyByRole('companies', currentUser, { companyField: 'id' });
            const companiesMap = new Map(companies.map((c: any) => [c.id, c.title]));
            const providers = await this.findManyByRole('users', currentUser, { companyField: 'company_id', where: { role_id: 3 }, include: { roles: true } });
            const providersMap = new Map(providers.map((p: any) => [p.id, p.username]));
            const events_count = new Map(items.map((i: any) => [i.id, i.event_lines?.length || 0]));
            const data = (items || []).map((item: any) => ({
                id: Number(item.id),
                name: item.title,
                image: item.image,
                description: item.description,
                category: item.item_category[0]?.categories?.title || '',
                price: this.toNumber(item.price),
                company: companiesMap.get(item.company_id) || '',
                provider: providersMap.get(item.provider_id) || '',
                status: item.status,
                event_id: item.event_lines[0]?.event_id ? Number(item.event_lines[0].event_id) : 0,
                events_count: events_count.get(item.id) || 0,
                created_at: this.fmtDate(logsMap.get(item.id)),
            }));
            return { data };
        } catch (error) { this.handleError('Error finding items', error); }
    }

    async getMedia(currentUser: any) {
        try {
            const media = await this.findManyByRole('item_media', currentUser, { include: { items: true, companies: true }, companyField: 'company_id' });
            const mediaIds = media.map((m: any) => m.id);
            const logs = await this.prisma.client.logs.findMany({ where: { entity: 'item_media', row_id: { in: mediaIds }, action: 'create' }, orderBy: { id: 'desc' } });
            const logsMap = new Map<any, Date>(logs.map((l: any) => [l.row_id, l.created_at]));
            const data = (media || []).map((m: any) => ({
                id: Number(m.id),
                filename: m.file.split('/').pop(),
                fileUrl: m.file,
                type: m.media_type || 'application/octet-stream',
                item_name: m.items?.title || 'N/A',
                company_name: m.companies?.title || 'N/A',
                uploaded_at: this.fmtDate(logsMap.get(m.id))
            }));
            return { data };
        } catch (error) { this.handleError('Error finding media', error); }
    }

    async getMediaStats(currentUser: any) {
        try {
            const media = await this.findManyByRole('item_media', currentUser, { companyField: 'company_id' });
            let image = 0;
            let video = 0;
            let document = 0;
            let other = 0;

            (media || []).forEach((m: any) => {
                const fileExtension = path.extname(m.file).toLowerCase();
                if (['.jpg', '.jpeg', '.png', '.gif'].includes(fileExtension)) { image++; }
                else if (['.mp4', '.webm', '.ogg'].includes(fileExtension)) { video++; }
                else if (['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'].includes(fileExtension)) { document++; }
                else { other++; }
            });

            return {
                total: media.length,
                image,
                video,
                document,
                other,
            };
        } catch (error) {
            this.handleError('Error finding item media stats', error);
        }
    }

    async getEvents(currentUser: any) {
        try {
            const events = await this.findManyByRole('events', currentUser, { companyField: 'company_id', include: { companies: true } });
            const now = new Date();
            const data = await Promise.all((events || []).map(async (e: any) => {
                const items = await this.findManyByRole('event_lines', currentUser, { where: { event_id: Number(e.id) } });
                const category = e.event_lines?.[0]?.items?.item_category?.[0]?.categories?.title || 'N/A';
                const attendees_count = items?.length || 0;
                let status = 'N/A';
                const startDate = e.start_date;
                const endDate = e.end_date;
                if (startDate && startDate > now && e.status === 0) status = 'Not Approved';
                else if (startDate && startDate > now && e.status === 1) status = 'Waiting';
                else if (startDate && startDate < now && e.status === 0) status = 'Retard';
                else if (startDate && startDate < now && endDate && endDate > now && e.status === 1) status = 'Active';
                else if (endDate && endDate < now && e.status === 1) status = 'Completed';
                else if (endDate && endDate < now && e.status === 0) status = 'Suspended';

                return {
                    id: Number(e.id),
                    company: e.companies?.title || '',
                    domain: e.companies?.domain || '',
                    category: category,
                    start_date: this.fmtDate(e.start_date),
                    end_date: this.fmtDate(e.end_date),
                    attendees_count: attendees_count,
                    status: status,
                };
            }));
            return { data };
        } catch (error) { this.handleError('Error finding events', error); }
    }

    async getEventsStats(currentUser: any) {
        try {
            const events = await this.findManyByRole('events', currentUser, { companyField: 'company_id' });
            const e = events || [];
            const now = new Date();
            const total = e.length;
            const notApproved = e.filter((ev: any) => ev.start_date > now && ev.status == 0).length;
            const waiting = e.filter((ev: any) => ev.start_date > now && ev.status == 1).length;
            const retard = e.filter((ev: any) => ev.start_date < now && ev.status == 0).length;
            const active = e.filter((ev: any) => ev.start_date < now && ev.end_date > now && ev.status == 1).length;
            const completed = e.filter((ev: any) => ev.end_date < now && ev.status == 1).length;
            const suspended = e.filter((ev: any) => ev.end_date < now && ev.status == 0).length;
            return { total, notApproved, waiting, retard, active, completed, suspended };
        } catch (error) { this.handleError('Error getting events stats', error); }
    }
    /**
     * Returns events count grouped by category for charting.
     */
    async getEventsPerCategory(currentUser: any) {
        try {
            const events = await this.findManyByRole('events', currentUser, { companyField: 'company_id', include: { event_lines: { include: { items: { include: { item_category: { include: { categories: true } } } } } } } });
            const categoryCounts: Record<string, number> = {};

            if (!events || events.length === 0) {
                return this.getItemsPerCategory(currentUser);
            }

            (events || []).forEach((e: any) => {
                const category = e.event_lines?.[0]?.items?.item_category?.[0]?.categories?.title || 'N/A';
                if (!categoryCounts[category]) { categoryCounts[category] = 0; }
                categoryCounts[category]++;
            });
            return Object.entries(categoryCounts).map(([name, events]) => ({ name, events }));
        } catch (error) { this.handleError('Error getting events per category', error); }
    }
    /**
     * Returns events count grouped by month for charting.
     */
    async getEventsByMonth(currentUser: any) {
        try {
            const events = await this.findManyByRole('events', currentUser, { companyField: 'company_id' });
            const monthCounts: Record<string, number> = {};
            if (!events || events.length === 0) {
                // Fallback to item creation trend if no events
                return this.getActivityTrend(currentUser, 'items');
            }
            const eventIds = events.map((e: any) => e.id);
            const logs = await this.prisma.client.logs.findMany({ where: { entity: 'events', action: 'create', row_id: { in: eventIds } }, select: { created_at: true, row_id: true }, orderBy: { id: 'desc' } });
            const eventCreationDates: { [key: number]: Date } = {};
            logs.forEach(log => { if (log && log.created_at && log.row_id) { eventCreationDates[Number(log.row_id)] = log.created_at; } });
            events.forEach((e: any) => {
                const creationDate = eventCreationDates[e.id];
                if (creationDate) {
                    const d = new Date(creationDate);
                    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                    monthCounts[key] = (monthCounts[key] || 0) + 1;
                }
            });
            return Object.entries(monthCounts).sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => ({ month, count }));
        } catch (error) {
            this.handleError('Error getting events by month', error);
            return [];
        }
    }

    /**
     * Generic trend based on log creation for any entity
     */
    async getActivityTrend(currentUser: any, entity: string) {
        const companyFilter = currentUser.role === 'Admin' ? { company_id: BigInt(currentUser.company_id) } : {};
        const logs = await this.prisma.client.logs.findMany({
            where: { entity, action: 'create', ...companyFilter },
            select: { created_at: true },
            orderBy: { created_at: 'asc' }
        });
        const trend: Record<string, number> = {};
        logs.forEach(l => {
            if (l.created_at) {
                const key = `${l.created_at.getFullYear()}-${String(l.created_at.getMonth() + 1).padStart(2, '0')}`;
                trend[key] = (trend[key] || 0) + 1;
            }
        });
        return Object.entries(trend).map(([month, count]) => ({ month, count }));
    }

    /**
     * Returns item count grouped by category for charting.
     */
    async getItemsPerCategory(currentUser: any) {
        try {
            const categories = await this.findManyByRole('categories', currentUser, {
                companyField: 'company_id',
                include: { item_category: { include: { items: true } } }
            });
            const counts = (categories || []).map(cat => ({
                name: cat.title,
                events: cat.item_category.reduce((sum, ic) => sum + (ic.items ? 1 : 0), 0)
            })).filter(c => c.events > 0);
            return counts;
        } catch (error) {
            this.handleError('Error getting items per category', error);
        }
    }

    /**
     * Returns user counts grouped by role for charting.
     */
    async getUsersPerRole(currentUser: any) {
        try {
            const users = await this.findManyByRole('users', currentUser, { include: { roles: true }, companyField: 'company_id' });
            const roleCounts: Record<string, number> = {};
            (users || []).forEach((u: any) => {
                const role = u.roles?.title || 'Unknown';
                if (!roleCounts[role]) roleCounts[role] = 0;
                roleCounts[role]++;
            });
            return Object.entries(roleCounts).map(([role, count]) => ({ role, count }));
        } catch (error) { this.handleError('Error getting users per role', error); }
    }

    async getUsersPerRoleAndStatus(currentUser: any) {
        try {
            const users = await this.findManyByRole('users', currentUser, { include: { roles: true }, companyField: 'company_id' });
            const roleStatusCounts: Record<string, { active: number, inactive: number }> = {};
            (users || []).forEach((u: any) => {
                const role = u.roles?.title || 'Unknown';
                if (!roleStatusCounts[role]) roleStatusCounts[role] = { active: 0, inactive: 0 };
                if (u.status === 1) { roleStatusCounts[role].active++; } else { roleStatusCounts[role].inactive++; }
            });
            return Object.entries(roleStatusCounts).map(([role, counts]) => ({ role, ...counts }));
        } catch (error) { this.handleError('Error getting users per role and status', error); }
    }
}