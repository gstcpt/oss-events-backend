import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { LogService } from '../../common/services/log.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService, private logService: LogService) { }
  async create(createNotificationDto: CreateNotificationDto) { try {
    const notification = await this.prisma.client.notifications.create({ data: createNotificationDto });
    await this.logService.createLogForUserAction(Number(notification.id), 'notifications', Number(notification.id), 'create', `Notification created: ${notification}`);
    return notification;
  } catch (error) { throw new BadRequestException('Error creating notification'); } }
  async findAllNotificationByUser(userId: number, page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;
      return this.prisma.client.notifications.findMany({ where: { receiver_id: Number(userId) }, orderBy: { created_at: 'desc' }, skip, take: limit });
    } catch (error) { throw new BadRequestException('Error fetching all notifications by user'); }
  }
  async findAll() { try { return this.prisma.client.notifications.findMany({ orderBy: { created_at: 'desc' } }); } catch (error) { throw new BadRequestException('Error fetching all notifications'); } }
  async countAllByUser(userId: number) { try { return this.prisma.client.notifications.count({ where: { receiver_id: Number(userId) } }); } catch (error) { throw new BadRequestException('Error counting all notifications by user'); } }
  async findLast5NotificationByUser(userId: number) { try { return this.prisma.client.notifications.findMany({ where: { receiver_id: Number(userId) }, orderBy: { created_at: 'desc' }, take: 5 }); } catch (error) { throw new BadRequestException('Error fetching last 5 notifications by user'); } }
  async markNotificationAsReadById(id: number) { try { return this.prisma.client.notifications.update({ where: { id }, data: { status: 1 } }); } catch (error) { throw new BadRequestException('Error marking notification as read'); } }
  async markNotificationAsUnreadById(id: number) { try { return this.prisma.client.notifications.update({ where: { id }, data: { status: 0 } }); } catch (error) { throw new BadRequestException('Error marking notification as unread'); } }
  async markAllNotificationAsReadById(userId: number) { try { return this.prisma.client.notifications.updateMany({ where: { receiver_id: Number(userId) }, data: { status: 1 } }); } catch (error) { throw new BadRequestException('Error marking all notifications as read by user'); } }
  async countUnreadNotificationsByUser(userId: number) { try { return this.prisma.client.notifications.count({ where: { receiver_id: Number(userId), status: 0 } }); } catch (error) { throw new BadRequestException('Error counting unread notifications by user'); } }
}