import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface TrackEventDto {
  pageViewId: number;
  type: string; // 'click', 'share', 'cta_submit', etc.
  name?: string;
  payload?: any;
}

export interface TrackShareDto {
  resourceType: 'categories' | 'items' | 'providers' | 'blogs';
  resourceId: number;
  userId?: number;
  companyId?: bigint;
  platform?: string; // 'facebook', 'twitter', 'linkedin', 'copy', etc.
  pageViewId?: number; // Optional: link to current page view
}

@Injectable()
export class PageEventService {
  constructor(private prisma: PrismaService) { }

  /**
   * Track a generic page event (click, video play, form submit, etc.)
   */
  async trackEvent(dto: TrackEventDto) {
    try {
      const event = await this.prisma.client.page_event.create({
        data: {
          pageViewId: dto.pageViewId,
          type: dto.type,
          name: dto.name || null,
          payload: dto.payload || null,
          createdAt: new Date(),
        },
      });

      // Increment interaction counter on the page view
      await this.prisma.client.page_view.update({
        where: { id: dto.pageViewId },
        data: {
          interactions_count: {
            increment: 1,
          },
        },
      });

      return {
        success: true,
        eventId: event.id,
      };
    } catch (error) {
      throw new BadRequestException('Failed to track event');
    }
  }

  /**
   * Track a share event specifically
   * This creates a PageEvent AND can be used for share counts
   */
  async trackShare(dto: TrackShareDto) {
    try {
      // If we have a pageViewId, create a PageEvent
      if (dto.pageViewId) {
        await this.trackEvent({
          pageViewId: dto.pageViewId,
          type: 'share',
          name: dto.platform || 'unknown',
          payload: {
            resourceType: dto.resourceType,
            resourceId: dto.resourceId,
            platform: dto.platform,
          },
        });
      }

      return {
        success: true,
        message: 'Share tracked successfully',
      };
    } catch (error) {
      throw new BadRequestException('Failed to track share');
    }
  }

  /**
   * Get share count for a resource
   */
  async getShareCount(resourceType: string, resourceId: number, companyId?: bigint) {
    try {
      const shares = await this.prisma.client.page_event.count({
        where: {
          type: 'share',
          payload: {
            path: ['resourceType'],
            equals: resourceType,
          },
          AND: {
            payload: {
              path: ['resourceId'],
              equals: resourceId,
            },
          },
        },
      });

      return {
        success: true,
        shareCount: shares,
      };
    } catch (error) {
      // Return 0 on error rather than failing
      return {
        success: true,
        shareCount: 0,
      };
    }
  }

  /**
   * Get event statistics for a page view
   */
  async getPageViewEvents(pageViewId: number) {
    try {
      const events = await this.prisma.client.page_event.findMany({
        where: { pageViewId },
        orderBy: { createdAt: 'asc' },
      });

      const eventTypes = events.reduce((acc: any, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {});

      return {
        success: true,
        total: events.length,
        byType: eventTypes,
        events: events.map(e => ({
          type: e.type,
          name: e.name,
          createdAt: e.createdAt,
        })),
      };
    } catch (error) {
      throw new BadRequestException('Failed to get page view events');
    }
  }

  /**
   * Get popular platforms for sharing (analytics)
   */
  async getSharePlatformStats(resourceType?: string, resourceId?: number) {
    try {
      const where: any = {
        type: 'share',
      };

      if (resourceType && resourceId) {
        where.payload = {
          path: ['resourceType'],
          equals: resourceType,
        };
        where.AND = {
          payload: {
            path: ['resourceId'],
            equals: resourceId,
          },
        };
      }

      const shares = await this.prisma.client.page_event.findMany({
        where,
        select: {
          name: true,
          payload: true,
        },
      });

      const platformCounts = shares.reduce((acc: any, share) => {
        const platform = share.name || 'unknown';
        acc[platform] = (acc[platform] || 0) + 1;
        return acc;
      }, {});

      return {
        success: true,
        platforms: platformCounts,
        total: shares.length,
      };
    } catch (error) {
      throw new BadRequestException('Failed to get platform stats');
    }
  }
}
