import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) { }

  async createNotification(actor_id: number, receiver_id: number, notification: string) {
    return this.prisma.client.notifications.create({
      data: {
        actor_id,
        receiver_id,
        notification,
        status: 0,
        created_at: new Date(),
      },
    });
  }
}