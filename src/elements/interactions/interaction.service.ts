import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';
import { LogService } from '../../common/services/log.service';

@Injectable()
export class InteractionService {
  constructor(private prisma: PrismaService, private logService: LogService) { }

  private convertBigIntToNumber(obj: any): any {
    if (obj === null || obj === undefined) { return obj; }
    if (typeof obj === 'bigint') { return Number(obj); }
    if (obj instanceof Date) { return obj; }
    if (Array.isArray(obj)) { return obj.map(item => this.convertBigIntToNumber(item)); }
    if (typeof obj === 'object') {
      const result: any = {};
      for (const key in obj) { result[key] = this.convertBigIntToNumber(obj[key]); }
      return result;
    }
    return obj;
  }

  async create(createInteractionDto: CreateInteractionDto, user: any) {
    try {
      const { item_id, ...restOfDto } = createInteractionDto;
      const data: any = { ...restOfDto, user_id: user.id };
      if (item_id) {
        data.target_type = 'ITEM';
        data.target_id = item_id;
      } else if (data.target_type) {
        data.target_type = data.target_type.toUpperCase();
      }
      if (data.type) {
        data.type = data.type.toUpperCase();
      }

      const interaction = await this.prisma.client.new_interactions.create({ data });
      const safeInteraction = this.convertBigIntToNumber(interaction);
      await this.logService.createLogForUserAction(Number(user.id), 'interactions', Number(interaction.id), 'create', `Interaction created: ${JSON.stringify(safeInteraction)}`);
      return { message: 'Interaction created successfully', interaction: safeInteraction };
    } catch (error) { throw new BadRequestException(error.message || 'Error creating interaction'); }
  }

  async findAll(user: any) {
    const where: any = {};
    if (Number(user.role_id) !== 1) {
      // Filter by company_id stored directly on the interaction record
      where.company_id = user.company_id;
    }
    const interactions = await this.prisma.client.new_interactions.findMany({ where, include: { users: true } });
    return this.convertBigIntToNumber(interactions);
  }

  async getInteractionStats(itemId: number, user: any) {
    const item = await this.prisma.client.items.findUnique({ where: { id: itemId } });
    if (!item) { throw new BadRequestException('Item not found'); }

    // Handle both lowercase 'item' (legacy) and uppercase 'ITEM'
    const interactions = await this.prisma.client.new_interactions.findMany({
      where: {
        target_id: BigInt(itemId),
        target_type: { in: ['ITEM', 'item'] }
      }
    });

    const commentsCount = await this.prisma.client.comments.count({
      where: {
        target_id: BigInt(itemId),
        target_type: { in: ['ITEM', 'item'] },
        is_deleted: false
      }
    });

    // Check for both 'items' and 'ITEM' for pageView resourceType if needed, but PageViewService usually uses 'items'
    const viewsCount = await this.prisma.client.page_view.count({
      where: {
        resourceId: itemId,
        resourceType: { in: ['items', 'ITEM'] }
      }
    });

    const stats = {
      likes: 0,
      dislikes: 0,
      favorites: 0,
      avgRating: 0,
      totalRatings: 0,
      views: viewsCount,
      shares: 0,
      comments: commentsCount,
    };
    let totalRatingValue = 0;
    const userReactions = {
      isLiked: false,
      isDisliked: false,
      userRating: null as number | null,
      isFavorite: false,
    };
    const userId = Number(user.id);
    interactions.forEach((interaction) => {
      const type = interaction.type.toLowerCase();
      const interactionUserId = Number(interaction.user_id);
      const isCurrentUser = interactionUserId === userId;
      switch (type) {
        case 'like':
          stats.likes++;
          if (isCurrentUser) userReactions.isLiked = true;
          break;
        case 'dislike':
          stats.dislikes++;
          if (isCurrentUser) userReactions.isDisliked = true;
          break;
        case 'favorite':
          stats.favorites++;
          if (isCurrentUser) userReactions.isFavorite = true;
          break;
        case 'rating':
          stats.totalRatings++;
          const ratingVal = Number(interaction.value) || 0;
          totalRatingValue += ratingVal;
          if (isCurrentUser) userReactions.userRating = ratingVal;
          break;
        case 'share':
          stats.shares++;
          break;
      }
    });
    if (stats.totalRatings > 0) {
      stats.avgRating = totalRatingValue / stats.totalRatings;
    }
    return {
      ...stats,
      userReactions
    };
  }

  async getAllInteractionTypes() {
    const types = await this.prisma.client.app_settings.findMany({ where: { famille: 'TYPE_INTERACTIONS' } });
    return this.convertBigIntToNumber(types);
  }

  async findOne(id: number, user: any) {
    const interaction = await this.prisma.client.new_interactions.findUnique({ where: { id } });
    if (!interaction) { throw new BadRequestException('Interaction not found'); }
    if (Number(user.role_id) !== 1 && Number(interaction.company_id) !== Number(user.company_id)) {
      throw new UnauthorizedException('You are not authorized to view this interaction.');
    }
    return this.convertBigIntToNumber(interaction);
  }

  async update(id: number, updateInteractionDto: UpdateInteractionDto, user: any) {
    try {
      const interactionToUpdate = await this.prisma.client.new_interactions.findUnique({ where: { id } });
      if (!interactionToUpdate) { throw new BadRequestException('Interaction not found'); }
      const isOwner = Number(interactionToUpdate.user_id) === Number(user.id);
      const canManageCompanyInteractions = Number(user.role_id) !== 1 && Number(user.company_id) === Number(interactionToUpdate.company_id);
      if (Number(user.role_id) !== 1 && !isOwner && !canManageCompanyInteractions) { throw new UnauthorizedException('You are not authorized to update this interaction.'); }
      const interaction = await this.prisma.client.new_interactions.update({ where: { id }, data: updateInteractionDto });
      const safeInteraction = this.convertBigIntToNumber(interaction);
      await this.logService.createLogForUserAction(Number(user.id), 'interactions', Number(interaction.id), 'update', `Interaction updated: ${JSON.stringify(safeInteraction)}`);
      return { message: 'Interaction updated successfully', interaction: safeInteraction };
    } catch (error) { throw new BadRequestException(error.message || 'Error updating interaction'); }
  }

  async remove(id: number, user: any) {
    try {
      const interactionToDelete = await this.prisma.client.new_interactions.findUnique({ where: { id } });
      if (!interactionToDelete) { throw new BadRequestException('Interaction not found'); }
      const isOwner = Number(interactionToDelete.user_id) === Number(user.id);
      const canManageCompanyInteractions = Number(user.role_id) !== 1 && Number(user.company_id) === Number(interactionToDelete.company_id);
      if (Number(user.role_id) !== 1 && !isOwner && !canManageCompanyInteractions) { throw new UnauthorizedException('You are not authorized to delete this interaction.'); }
      const interaction = await this.prisma.client.new_interactions.delete({ where: { id } });
      const safeInteraction = this.convertBigIntToNumber(interaction);
      await this.logService.createLogForUserAction(Number(user.id), 'interactions', Number(interaction.id), 'delete', `Interaction deleted: ${JSON.stringify(safeInteraction)}`);
      return { message: 'Interaction deleted successfully', interaction: safeInteraction };
    } catch (error) { throw new BadRequestException(error.message || 'Error deleting interaction'); }
  }
  async findUserHistory(user: any) {
    try {
      const limit = 100;
      const [interactions, comments] = await Promise.all([
        this.prisma.client.new_interactions.findMany({
          where: { user_id: BigInt(String(user.id)) },
          orderBy: { created_at: 'desc' },
          take: limit
        }),
        this.prisma.client.comments.findMany({
          where: { user_id: BigInt(String(user.id)), is_deleted: false },
          orderBy: { created_at: 'desc' },
          take: limit
        })
      ]);

      const formattedInteractions = interactions.map(i => ({ ...i }));
      const formattedComments = comments.map(c => ({ ...c, type: 'COMMENT' }));

      const allActivities = [...formattedInteractions, ...formattedComments]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);

      const safeActivities = this.convertBigIntToNumber(allActivities);
      const results: any[] = [];

      const itemIds: bigint[] = [];
      const blogIds: bigint[] = [];
      const categoryIds: bigint[] = [];
      const providerIds: bigint[] = [];

      for (const act of safeActivities) {
        const type = (act.target_type || '').toUpperCase();
        const tid = BigInt(act.target_id);
        if (type === 'ITEM') itemIds.push(tid);
        else if (type === 'BLOG') blogIds.push(tid);
        else if (type === 'CATEGORY') categoryIds.push(tid);
        else if (type === 'PROVIDER') providerIds.push(tid);
      }

      const itemsMap: any = {};
      const blogsMap: any = {};
      const categoriesMap: any = {};
      const providersMap: any = {};

      if (itemIds.length > 0) {
        const items = await this.prisma.client.items.findMany({
          where: { id: { in: itemIds } },
          select: { id: true, title: true, image: true, cover: true, code: true, price: true, description: true }
        });
        this.convertBigIntToNumber(items).forEach((i: any) => itemsMap[i.id] = i);
      }

      if (blogIds.length > 0 && this.prisma.client.blogs) {
        const blogs = await this.prisma.client.blogs.findMany({
          where: { id: { in: blogIds } },
          select: { id: true, title: true, image: true, content: true }
        });
        this.convertBigIntToNumber(blogs).forEach((b: any) => blogsMap[b.id] = b);
      }

      if (categoryIds.length > 0 && this.prisma.client.categories) {
        const categories = await this.prisma.client.categories.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, title: true, image: true }
        });
        this.convertBigIntToNumber(categories).forEach((c: any) => categoriesMap[c.id] = c);
      }

      if (providerIds.length > 0 && this.prisma.client.companies) {
        const companies = await this.prisma.client.companies.findMany({
          where: { id: { in: providerIds } },
          select: { id: true, title: true, logo: true, description: true } // Map logo to image
        });
        this.convertBigIntToNumber(companies).forEach((c: any) => {
          c.image = c.logo; // Map logo for unified UI
          providersMap[c.id] = c;
        });
      }

      for (const act of safeActivities) {
        const type = (act.target_type || '').toUpperCase();
        let target: any = null;
        if (type === 'ITEM') target = itemsMap[act.target_id];
        else if (type === 'BLOG') target = blogsMap[act.target_id];
        else if (type === 'CATEGORY') target = categoriesMap[act.target_id];
        else if (type === 'PROVIDER') target = providersMap[act.target_id];

        if (target) {
          if (type === 'BLOG' && target.content && !target.description) {
            target.description = target.content.substring(0, 100);
            delete target.content;
          }
          results.push({ ...act, target });
        }
      }

      return results;
    } catch (error) {
      throw new BadRequestException('Failed to fetch user history');
    }
  }
}