import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface TrackPageViewDto {
  sessionId: number;
  visitorId: number;
  userId?: number;
  companyId?: bigint;
  resourceType?: 'categories' | 'items' | 'providers' | 'blogs';
  resourceId?: number;
  path: string;
  title?: string;
  query?: any;
}

export interface ViewStatsDto {
  resourceType: 'categories' | 'items' | 'providers' | 'blogs';
  resourceId: number;
  companyId?: bigint;
}

@Injectable()
export class PageViewService {
  constructor(private prisma: PrismaService) { }

  /**
   * Track a page view
   */
  async trackPageView(dto: TrackPageViewDto) {
    try {
      const pageView = await this.prisma.client.page_view.create({
        data: {
          sessionId: dto.sessionId,
          visitorId: dto.visitorId,
          userId: dto.userId || null,
          company_id: dto.companyId || null,
          resourceType: dto.resourceType || null,
          resourceId: dto.resourceId || null,
          path: dto.path,
          title: dto.title || null,
          query: dto.query || null,
          startedAt: new Date(),
        },
      });

      return {
        success: true,
        pageViewId: pageView.id,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to track page view: ${error.message}`);
    }
  }

  /**
   * Update page view when user leaves (track duration, scroll depth)
   */
  async endPageView(pageViewId: number, durationMs: number, scrollDepthPct?: number) {
    try {
      await this.prisma.client.page_view.update({
        where: { id: pageViewId },
        data: {
          endedAt: new Date(),
          durationMs,
          scrollDepthPct: scrollDepthPct || null,
        },
      });

      return { success: true };
    } catch (error) {
      throw new BadRequestException('Failed to end page view');
    }
  }

  /**
   * Get view statistics for a resource (item, provider, blog, category)
   */
  async getViewStats(dto: ViewStatsDto) {
    try {
      const where: any = {
        resourceType: dto.resourceType,
        resourceId: dto.resourceId,
      };

      if (dto.companyId) {
        where.company_id = dto.companyId;
      }

      const totalViews = await this.prisma.client.page_view.count({ where });

      const uniqueVisitors = await this.prisma.client.page_view.findMany({
        where,
        select: { visitorId: true },
        distinct: ['visitorId'],
      });

      const uniqueUsers = await this.prisma.client.page_view.findMany({
        where: {
          ...where,
          userId: { not: null },
        },
        select: { userId: true },
        distinct: ['userId'],
      });

      // Average duration
      const viewsWithDuration = await this.prisma.client.page_view.findMany({
        where: {
          ...where,
          durationMs: { not: null },
        },
        select: { durationMs: true },
      });

      const avgDuration =
        viewsWithDuration.length > 0
          ? viewsWithDuration.reduce((sum, v) => sum + (v.durationMs || 0), 0) / viewsWithDuration.length
          : 0;

      return {
        success: true,
        stats: {
          totalViews,
          uniqueVisitors: uniqueVisitors.length,
          uniqueUsers: uniqueUsers.length,
          avgDurationMs: Math.round(avgDuration),
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to get view stats');
    }
  }

  /**
   * Increment interaction counter for a page view
   */
  async incrementInteractions(pageViewId: number) {
    try {
      await this.prisma.client.page_view.update({
        where: { id: pageViewId },
        data: {
          interactions_count: {
            increment: 1,
          },
        },
      });

      return { success: true };
    } catch (error) {
      // Silently fail - not critical
      return { success: false };
    }
  }

  /**
   * Get recent views for a company (for analytics dashboard)
   */
  async getRecentViews(companyId: bigint, limit: number = 100) {
    try {
      const views = await this.prisma.client.page_view.findMany({
        where: { company_id: companyId },
        orderBy: { startedAt: 'desc' },
        take: limit,
        select: {
          id: true,
          path: true,
          title: true,
          resourceType: true,
          resourceId: true,
          startedAt: true,
          durationMs: true,
          userId: true,
          visitorId: true,
        },
      });

      return {
        success: true,
        views: this.convertBigIntToNumber(views),
      };
    } catch (error) {
      throw new BadRequestException('Failed to get recent views');
    }
  }

  private convertBigIntToNumber(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return Number(obj);
    if (Array.isArray(obj)) return obj.map(item => this.convertBigIntToNumber(item));
    if (typeof obj === 'object') {
      const result: any = {};
      for (const key in obj) {
        result[key] = this.convertBigIntToNumber(obj[key]);
      }
      return result;
    }
    return obj;
  }
}
