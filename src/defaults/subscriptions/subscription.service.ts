import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { LogService } from '../../common/services/log.service';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService, private logService: LogService) { }
  
  async create(createSubscriptionDto: CreateSubscriptionDto, currentUser?: any) {
    try {
      const { currentUser: dtoCurrentUser, ...subscriptionData } = createSubscriptionDto;
      const userContext = currentUser || dtoCurrentUser;
      
      const subscription = await this.prisma.client.subscriptions.create({ 
        data: subscriptionData,
        include: { companies: true, packs: true }
      });
      if (userContext) {
        await this.logService.createLogForUserAction(Number(userContext.id), 'subscriptions', Number(subscription.id), 'create', `Subscription created: ${subscription.id}`);
      }
      return { message: 'Subscription created successfully', subscription };
    } catch (error) { throw new BadRequestException('Error creating subscription'); }
  }
  
  async findAll(currentUser?: any) { 
    const whereClause = currentUser?.role !== 'Root' && currentUser?.company_id 
      ? { company_id: Number(currentUser.company_id) } 
      : {};
    const subscriptions = await this.prisma.client.subscriptions.findMany({ 
      where: whereClause,
      include: { companies: true, packs: true },
      orderBy: { id: 'desc' }
    });
    return subscriptions.map((subscription) => ({
      ...subscription,
      packs: subscription.packs ? {
        ...subscription.packs,
        price: subscription.packs.price ? subscription.packs.price.toNumber() : null
      } : null
    }));
  }
  
  async findOne(id: number, currentUser?: any) { 
    const whereClause = currentUser?.role !== 'Root' && currentUser?.company_id 
      ? { id, company_id: Number(currentUser.company_id) } 
      : { id };
    const subscription = await this.prisma.client.subscriptions.findUnique({ 
      where: whereClause, 
      include: { companies: true, packs: true } 
    });
    if (subscription) {
      return {
        ...subscription,
        packs: subscription.packs ? {
          ...subscription.packs,
          price: subscription.packs.price ? subscription.packs.price.toNumber() : null
        } : null
      };
    }
    return null;
  }
  
  async update(id: number, updateSubscriptionDto: UpdateSubscriptionDto, currentUser?: any) {
    try {
      const { currentUser: dtoCurrentUser, ...subscriptionData } = updateSubscriptionDto;
      const userContext = currentUser || dtoCurrentUser;
      
      const whereClause = userContext?.role !== 'Root' && userContext?.company_id 
        ? { id, company_id: Number(userContext.company_id) } 
        : { id };
      const subscription = await this.prisma.client.subscriptions.update({ 
        where: whereClause, 
        data: subscriptionData,
        include: { companies: true, packs: true }
      });
      if (userContext) {
        await this.logService.createLogForUserAction(Number(userContext.id), 'subscriptions', Number(subscription.id), 'update', `Subscription updated: ${subscription.id}`);
      }
      return { message: 'Subscription updated successfully', subscription };
    } catch (error) { throw new BadRequestException('Error updating subscription'); }
  }
  
  async remove(id: number, currentUser?: any) {
    try {
      const whereClause = currentUser?.role !== 'Root' && currentUser?.company_id 
        ? { id, company_id: Number(currentUser.company_id) } 
        : { id };
      const subscription = await this.prisma.client.subscriptions.delete({ where: whereClause });
      if (currentUser) {
        await this.logService.createLogForUserAction(Number(currentUser.id), 'subscriptions', Number(subscription.id), 'delete', `Subscription deleted: ${subscription.id}`);
      }
      return { message: 'Subscription deleted successfully', subscription };
    } catch (error) { throw new BadRequestException('Error deleting subscription'); }
  }
}