import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LogService {
  constructor(private readonly prismaService: PrismaService) { }
  async getLogs(user: any, selectedCompanyId?: number) { return this.getLogsByParams(user.role_id, user.company_id, user.id, selectedCompanyId); }
  async getLogsByParams(roleId: number, userCompanyId?: number, userId?: number, selectedCompanyId?: number) {
    const role = await this.prismaService.client.roles.findUnique({ where: { id: BigInt(roleId) }, select: { title: true } });
    const roleTitle = role?.title;
    if (roleTitle === 'Root') {
      return this.prismaService.client.logs.findMany({
        include: { users: { select: { firstname: true, lastname: true, email: true } }, companies: { select: { title: true } } },
        orderBy: { id: 'desc' }
      });
    }
    if (!userCompanyId) return [];
    const companyId = BigInt(userCompanyId);
    if (roleTitle === 'Admin') {
      return this.prismaService.client.logs.findMany({
        where: { company_id: companyId },
        include: { users: { select: { firstname: true, lastname: true, email: true } }, companies: { select: { title: true } } },
        orderBy: { id: 'desc' }
      });
    }
    if (!userId) return [];
    const userIdBigInt = BigInt(userId);
    if (roleTitle === 'Provider') {
      const [itemIds, itemOccupationIds] = await Promise.all([this.getProviderItemIds(userIdBigInt), this.getProviderItemOccupationIds(userIdBigInt)]);
      return this.prismaService.client.logs.findMany({
        where: { company_id: companyId, OR: [{ entity: 'items', row_id: { in: itemIds } }, { entity: 'itemOccupation', row_id: { in: itemOccupationIds } }] },
        include: { users: { select: { firstname: true, lastname: true, email: true } }, companies: { select: { title: true } } },
        orderBy: { id: 'desc' },
        take: 100
      });
    }
    if (roleTitle === 'Client') {
      const eventIds = await this.getClientEventIds(userIdBigInt);
      return this.prismaService.client.logs.findMany({
        where: { company_id: companyId, entity: 'events', row_id: { in: eventIds } },
        include: { users: { select: { firstname: true, lastname: true, email: true } }, companies: { select: { title: true } } },
        orderBy: { id: 'desc' },
        take: 50
      });
    }
    return [];
  }
  private async getProviderItemIds(userId: bigint) {
    const items = await this.prismaService.client.items.findMany({ where: { provider_id: userId }, select: { id: true } });
    return items.map(i => i.id);
  }
  private async getProviderItemOccupationIds(userId: bigint) {
    const itemOccupations = await this.prismaService.client.item_occupation.findMany({ where: { items: { provider_id: userId } }, select: { id: true } });
    return itemOccupations.map(io => io.id);
  }
  private async getClientEventIds(userId: bigint) {
    const events = await this.prismaService.client.events.findMany({ where: { client_id: userId }, select: { id: true } });
    return events.map(e => e.id);
  }
  async deleteLog(id: number) { return this.prismaService.client.logs.delete({ where: { id: BigInt(id) } }); }
}