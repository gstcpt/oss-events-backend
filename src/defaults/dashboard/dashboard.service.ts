import { Injectable, Scope, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class DashboardService {
    private readonly logger = new Logger(DashboardService.name);
    constructor(private prisma: PrismaService) { }

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

    private fmtDate(d?: Date | null) { return d ? d.toISOString().split('T')[0] : ''; }

    private async getCompanyFilter(currentUser: any) {
        await this.ensureRole(currentUser);
        if (currentUser.role === 'Root') return {};
        if (!currentUser.company_id) return { id: BigInt(-1) };
        return { company_id: BigInt(currentUser.company_id) };
    }

    private async getUserFilter(currentUser: any, roleTitle?: string) {
        await this.ensureRole(currentUser);
        const where: any = {};
        if (roleTitle) { where.roles = { title: roleTitle }; }
        if (currentUser.role === 'Admin' && currentUser.company_id) { where.company_id = BigInt(currentUser.company_id); }
        else if (currentUser.role === 'Provider') { where.id = BigInt(currentUser.id); }
        else if (currentUser.role === 'Client') { where.id = BigInt(currentUser.id); }
        return where;
    }

    async getDashboard(currentUser: any) {
        this.logger.log(`Getting dashboard for user: ${currentUser.email}`);
        try {
            await this.ensureRole(currentUser);
            const role = currentUser.role;
            const data: any = { profile: { ...currentUser, password: '' } };

            if (role === 'Root') {
                data.stats = await this.getRootStats();
                data.liveActivity = await this.getLiveActivity('Root');
                data.topItems = await this.getTopItems(currentUser);
                data.topCategories = await this.getTopCategories(currentUser);
                data.topTags = await this.getTopTags(currentUser);
                data.lastItems = await this.getLastItems(currentUser);
                data.lastProviders = await this.getLastProviders(currentUser);
                data.lastClients = await this.getLastClients(currentUser);
                data.lastEvents = await this.getLastEvents(currentUser);
                data.quickAccess = [
                    { icon: 'Building2', title: 'Manage Companies', description: 'View and manage all registered companies.', buttonText: 'View Companies', href: '/dashboard/companies' },
                    { icon: 'Users', title: 'User Management', description: 'Manage system-wide users and roles.', buttonText: 'View Users', href: '/dashboard/users' },
                    { icon: 'BarChart3', title: 'Global Stats', description: 'Deep dive into system analytics.', buttonText: 'View Reports', href: '/dashboard/reports' }
                ];
            } else if (role === 'Admin') {
                data.stats = await this.getAdminStats(currentUser);
                data.liveActivity = await this.getLiveActivity('Admin', currentUser.company_id);
                data.topItems = await this.getTopItems(currentUser);
                data.topCategories = await this.getTopCategories(currentUser);
                data.topTags = await this.getTopTags(currentUser);
                data.lastItems = await this.getLastItems(currentUser);
                data.lastProviders = await this.getLastProviders(currentUser);
                data.lastClients = await this.getLastClients(currentUser);
                data.lastEvents = await this.getLastEvents(currentUser);
                data.revenues = await this.getRevenues(currentUser);
                data.quickAccess = [
                    { icon: 'Plus', title: 'Add Provider', description: 'Onboard a new service provider.', buttonText: 'Add Provider', href: '/dashboard/users/providers' },
                    { icon: 'Users', title: 'Manage Clients', description: 'View your company\'s client base.', buttonText: 'View Clients', href: '/dashboard/users/clients' },
                    { icon: 'Calendar', title: 'View Events', description: 'Manage company events and bookings.', buttonText: 'View Events', href: '/dashboard/events' }
                ];
            } else if (role === 'Provider') {
                data.stats = await this.getProviderStats(currentUser);
                data.liveActivity = await this.getLiveActivity('Provider', undefined, currentUser.id);
                data.upcomingEvents = await this.getProviderUpcomingEvents(currentUser);
                data.quickAccess = [
                    { icon: 'PlusCircle', title: 'New Item', description: 'Add a new product or service.', buttonText: 'Add Item', href: '/dashboard/items/new' },
                    { icon: 'Package', title: 'My Items', description: 'Manage your active listings.', buttonText: 'View Items', href: '/dashboard/items' },
                    { icon: 'CalendarDays', title: 'Upcoming Bookings', description: 'Check your scheduled events.', buttonText: 'View Calendar', href: '/dashboard/calendar' }
                ];
            } else if (role === 'Client') {
                data.stats = await this.getClientStats(currentUser);
                data.liveActivity = await this.getLiveActivity('Client', undefined, currentUser.id);
                data.upcomingEvents = await this.getClientUpcomingEvents(currentUser);
                data.quickAccess = [
                    { icon: 'Search', title: 'Find Items', description: 'Browse available services.', buttonText: 'Browse', href: '/items' },
                    { icon: 'PlusSquare', title: 'Book Event', description: 'Plan your next amazing event.', buttonText: 'Create Event', href: '/createEvent' },
                    { icon: 'Heart', title: 'Favorites', description: 'Items you\'ve liked or saved.', buttonText: 'View Favorites', href: '/dashboard/favorites' }
                ];
            }

            return data;
        } catch (error) {
            this.logger.error('Failed to get dashboard', error.stack);
            this.handleError('Failed to get dashboard', error);
        }
    }

    private async getRootStats() {
        const [providers, clients, items, events, categories, tags] = await Promise.all([
            this.prisma.client.users.count({ where: { roles: { title: 'Provider' } } }),
            this.prisma.client.users.count({ where: { roles: { title: 'Client' } } }),
            this.prisma.client.items.count(),
            this.prisma.client.events.count(),
            this.prisma.client.categories.count(),
            this.prisma.client.tags.count()
        ]);
        return { providers, clients, items, events, categories, tags };
    }

    private async getLiveActivity(role: string, company_id?: any, user_id?: any) {
        const activities: any[] = [];
        const interactionWhere: any = {};
        if (company_id) interactionWhere.company_id = BigInt(company_id);
        if (user_id && role === 'Client') interactionWhere.user_id = BigInt(user_id);
        if (user_id && role === 'Provider') {
            const providerItems = await this.prisma.client.items.findMany({ where: { provider_id: BigInt(user_id) }, select: { id: true } });
            interactionWhere.target_type = 'ITEM';
            interactionWhere.target_id = { in: providerItems.map(i => i.id) };
        }
        const interactions = await this.prisma.client.new_interactions.findMany({ where: interactionWhere, orderBy: { created_at: 'desc' }, take: 10, include: { users: { select: { firstname: true, lastname: true, avatar: true } } } });
        for (const inter of interactions) {
            activities.push({
                id: `inter-${inter.id}`,
                type: 'interaction',
                action: inter.type,
                targetType: inter.target_type,
                targetId: inter.target_id.toString(),
                user: `${inter.users.firstname} ${inter.users.lastname}`,
                avatar: inter.users.avatar,
                timestamp: inter.created_at,
                description: this.getInteractionDescription(role, inter)
            });
        }
        const eventWhere: any = {};
        if (company_id) eventWhere.company_id = BigInt(company_id);
        if (user_id && role === 'Client') eventWhere.client_id = BigInt(user_id);
        if (user_id && role === 'Provider') { eventWhere.event_lines = { some: { items: { provider_id: BigInt(user_id) } } }; }
        const events = await this.prisma.client.events.findMany({ where: eventWhere, orderBy: { id: 'desc' }, take: 5, include: { users: { select: { firstname: true, lastname: true, avatar: true } } } });
        for (const event of events) {
            activities.push({ id: `event-${event.id}`, type: 'event', action: 'BOOKING', title: event.title, user: `${event.users?.firstname || 'System'} ${event.users?.lastname || ''}`, avatar: event.users?.avatar, timestamp: new Date(), description: `New event booking: ${event.title}` });
        }
        return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
    }

    private getInteractionDescription(role: string, inter: any) {
        const userName = `${inter.users.firstname} ${inter.users.lastname}`;
        const verb = inter.type === 'LIKE' ? 'liked' : inter.type === 'RATING' ? `rated (${inter.value}/5)` : 'interacted with';
        const target = inter.target_type.toLowerCase();
        return `${userName} ${verb} a ${target}.`;
    }

    async getStats(currentUser: any) {
        try {
            const companyFilter = await this.getCompanyFilter(currentUser);
            const totalEvents = await this.prisma.client.events.count({ where: companyFilter });
            const completedEvents = await this.prisma.client.events.count({ where: { ...companyFilter, status: 5 } });
            const upcomingEvents = await this.prisma.client.events.count({ where: { ...companyFilter, start_date: { gte: new Date() } } });
            const canceledEvents = await this.prisma.client.events.count({ where: { ...companyFilter, status: 0 } });
            return { totalEvents, completedEvents, upcomingEvents, canceledEvents };
        } catch (error) { throw new BadRequestException('Failed to get dashboard stats', error.message); }
    }

    async getUpcomingEvents(currentUser: any) {
        const companyFilter = await this.getCompanyFilter(currentUser);
        return await this.prisma.client.events.findMany({ where: { ...companyFilter, start_date: { gte: new Date() } }, take: 5, orderBy: { start_date: 'asc' }, include: { users: { select: { firstname: true, lastname: true, email: true } } } });
    }

    async getRecentEvents(currentUser: any) {
        const companyFilter = await this.getCompanyFilter(currentUser);
        return await this.prisma.client.events.findMany({ where: companyFilter, take: 5, orderBy: { id: 'desc' }, include: { users: { select: { firstname: true, lastname: true, email: true } } } });
    }

    async getEventsPerMonth(currentUser: any) {
        const companyFilter = await this.getCompanyFilter(currentUser);
        const events = await this.prisma.client.events.findMany({ where: companyFilter, select: { start_date: true }, });
        const monthCounts = events.reduce((acc, event) => {
            if (event.start_date) {
                const month = new Date(event.start_date).toLocaleString('default', { month: 'short' });
                acc[month] = (acc[month] || 0) + 1;
            }
            return acc;
        }, {});
        return Object.entries(monthCounts).map(([name, events]) => ({ name, events }));
    }

    async getEventTypes(currentUser: any) {
        const companyFilter = await this.getCompanyFilter(currentUser);
        const events = await this.prisma.client.events.findMany({ where: companyFilter, include: { event_lines: { include: { items: { include: { item_category: { include: { categories: true } } } } } } } });
        const typeCounts = events.reduce((acc, event) => {
            const type = event.event_lines[0]?.items?.item_category[0]?.categories.title || 'Other';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
        const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];
        let colorIndex = 0;
        return Object.entries(typeCounts).map(([name, value]) => ({ name, value, color: colors[colorIndex++ % colors.length] }));
    }

    async getRevenuePerMonth(currentUser: any) {
        try {
            const companyFilter = await this.getCompanyFilter(currentUser);
            const events = await this.prisma.client.events.findMany({ where: { ...companyFilter, status: 5 }, include: { event_lines: true } });
            const revenueByMonth = events.reduce((acc, event) => {
                if (event.start_date) {
                    const month = new Date(event.start_date).toLocaleString('default', { month: 'short' });
                    const revenue = event.event_lines.reduce((sum, line) => sum + Number(line.price_ttc || 0), 0);
                    acc[month] = (acc[month] || 0) + revenue;
                }
                return acc;
            }, {});
            return Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue }));
        } catch (error) {
            this.logger.error('Failed to get revenue per month', error.stack);
            throw new BadRequestException('Failed to get revenue per month');
        }
    }

    async getAdminStats(currentUser: any) {
        const companyFilter = await this.getCompanyFilter(currentUser);
        const [providersCount, clientsCount, events, items, categories, tags] = await Promise.all([
            this.prisma.client.users.count({ where: { ...await this.getUserFilter(currentUser, 'Provider') } }),
            this.prisma.client.users.count({ where: { ...await this.getUserFilter(currentUser, 'Client') } }),
            this.prisma.client.events.count({ where: companyFilter }),
            this.prisma.client.items.count({ where: companyFilter }),
            this.prisma.client.categories.count({ where: companyFilter }),
            this.prisma.client.tags.count({ where: companyFilter })
        ]);
        return { providers: providersCount, clients: clientsCount, events, items, categories, tags };
    }

    async getProviderStats(currentUser: any) {
        const provider_id = BigInt(currentUser.id);
        const itemsCount = await this.prisma.client.items.count({ where: { provider_id } });
        const eventLines = await this.prisma.client.event_lines.findMany({ where: { items: { provider_id } }, select: { event_id: true } });
        const uniqueEventIds = [...new Set(eventLines.map(el => el.event_id))];
        const bookingsCount = uniqueEventIds.length;
        const interactions = await this.prisma.client.new_interactions.count({ where: { target_type: 'ITEM', target_id: { in: (await this.prisma.client.items.findMany({ where: { provider_id }, select: { id: true } })).map(i => i.id) } } });
        return { items: itemsCount, bookings: bookingsCount, interactions };
    }

    async getClientStats(currentUser: any) {
        const client_id = BigInt(currentUser.id);
        const [eventsCount, interactionsCount] = await Promise.all([this.prisma.client.events.count({ where: { client_id } }), this.prisma.client.new_interactions.count({ where: { user_id: client_id } })]);
        return { events: eventsCount, interactions: interactionsCount };
    }

    async getTopItems(currentUser: any) {
        const companyFilter = await this.getCompanyFilter(currentUser);
        const items = await this.prisma.client.items.findMany({ where: companyFilter, include: { event_lines: { select: { id: true } } }, take: 20 });
        return items.map(item => ({ title: item.title, count: item.event_lines.length })).sort((a, b) => b.count - a.count).slice(0, 5);
    }

    async getTopCategories(currentUser: any) {
        const companyFilter = await this.getCompanyFilter(currentUser);
        const categories = await this.prisma.client.categories.findMany({ where: companyFilter, include: { item_category: { include: { items: { include: { event_lines: { select: { id: true } } } } } } } });
        return categories.map(cat => ({ title: cat.title, count: cat.item_category.reduce((sum, ic) => sum + ic.items.event_lines.length, 0) })).sort((a, b) => b.count - a.count).slice(0, 5);
    }

    async getTopTags(currentUser: any) {
        const companyFilter = await this.getCompanyFilter(currentUser);
        const tags = await this.prisma.client.tags.findMany({
            where: companyFilter,
            include: { category_tags: { select: { id: true } } }
        });
        return tags.map(tag => ({ title: tag.title, count: tag.category_tags.length })).sort((a, b) => b.count - a.count).slice(0, 5);
    }

    async getRevenues(currentUser: any) {
        const companyFilter = await this.getCompanyFilter(currentUser);
        const events = await this.prisma.client.events.findMany({ where: { ...companyFilter, status: 5 }, include: { event_lines: true } });
        return events.reduce((sum, event) => sum + event.event_lines.reduce((s, line) => s + Number(line.price_ttc || 0), 0), 0);
    }

    async getLastItems(currentUser: any) {
        const companyFilter = await this.getCompanyFilter(currentUser);
        const items = await this.prisma.client.items.findMany({ where: companyFilter, orderBy: { id: 'desc' }, take: 5, select: { title: true, id: true } });
        return items.map(item => ({ title: item.title, created_at: 'Recently' }));
    }

    async getLastProviders(currentUser: any) {
        const companyFilter = await this.getCompanyFilter(currentUser);
        const providers = await this.prisma.client.users.findMany({
            where: { ...companyFilter, roles: { title: 'Provider' } },
            orderBy: { id: 'desc' },
            take: 5,
            select: { firstname: true, lastname: true }
        });
        return providers.map(p => ({ name: `${p.firstname} ${p.lastname}`, created_at: 'Recently' }));
    }

    async getLastClients(currentUser: any) {
        const companyFilter = await this.getCompanyFilter(currentUser);
        const clients = await this.prisma.client.users.findMany({
            where: { ...companyFilter, roles: { title: 'Client' } },
            orderBy: { id: 'desc' },
            take: 5,
            select: { firstname: true, lastname: true }
        });
        return clients.map(c => ({ name: `${c.firstname} ${c.lastname}`, created_at: 'Recently' }));
    }

    async getLastEvents(currentUser: any) {
        const companyFilter = await this.getCompanyFilter(currentUser);
        const events = await this.prisma.client.events.findMany({ where: companyFilter, orderBy: { id: 'desc' }, take: 5, select: { id: true, title: true, start_date: true, end_date: true } });
        return events.map(e => ({ id: Number(e.id), title: e.title, start_date: this.fmtDate(e.start_date) || 'N/A', end_date: this.fmtDate(e.end_date) || 'N/A' }));
    }

    async getProviderUpcomingEvents(currentUser: any) {
        const provider_id = BigInt(currentUser.id);
        const events = await this.prisma.client.events.findMany({
            where: { event_lines: { some: { items: { provider_id } } }, start_date: { gte: new Date() } },
            select: { id: true, title: true, start_date: true, end_date: true },
            orderBy: { start_date: 'asc' },
            take: 5
        });
        return events.map(event => ({ id: Number(event.id), title: event.title, start_date: this.fmtDate(event?.start_date), end_date: this.fmtDate(event?.end_date) }));
    }

    async getClientUpcomingEvents(currentUser: any) {
        const client_id = BigInt(currentUser.id);
        const events = await this.prisma.client.events.findMany({ where: { client_id, start_date: { gte: new Date() } }, select: { id: true, title: true, start_date: true, end_date: true }, orderBy: { start_date: 'asc' }, take: 5 });
        return events.map(event => ({ id: Number(event.id), title: event.title, start_date: this.fmtDate(event?.start_date), end_date: this.fmtDate(event?.end_date) }));
    }

    async getCompanyAddress(currentUser: any) {
        try {
            await this.ensureRole(currentUser);
            if (currentUser.role === 'Root' || !currentUser.company_id) return { address: null };
            const addressSetting = await this.prisma.client.app_settings.findFirst({ where: { famille: 'ADRESS' } });
            if (!addressSetting) return { address: null };
            const companySetting = await this.prisma.client.company_settings.findFirst({ where: { company_id: BigInt(currentUser.company_id), app_settings_id: addressSetting.id } });
            return { address: companySetting?.custom_value || null };
        } catch (error) { this.handleError('Failed to get company address', error); }
    }
}