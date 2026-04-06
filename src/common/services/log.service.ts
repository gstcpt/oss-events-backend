import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LogService {
  constructor(private prisma: PrismaService) { }

  async createLog(entity: string, row_id: number, actor_id: number | null, action: string, log_message: string, company_id: bigint | null) {
    return this.prisma.client.logs.create({
      data: {
        entity,
        row_id,
        actor_id,
        action,
        log_message,
        company_id,
        created_at: new Date(),
      },
    });
  }

  async createLogForUserAction(userId: number, entity: string, row_id: number, action: string, log_message: string) {
    const row = await this.prisma.client[entity].findUnique({ where: { id: row_id } });
    const user = await this.prisma.client.users.findUnique({ where: { id: userId } });
    const company_id = row?.company_id || user?.company_id || null;
    return this.createLog(entity, row_id, userId, action, log_message, company_id);
  }
}