import { Controller, Get, Post, Body, Param, Query, Req, Res } from '@nestjs/common';
import { AudianceService } from './audiance.service';
import { CreateVisitorDto, CreateSessionDto, CreatePageViewDto, CreatePageEventDto, GetVisitorsDto, GetSessionsDto, GetPageViewsDto, GetAudienceStatsDto } from './dto/audiance.dto';
import { User } from '../../common/decorators/user.decorator';
import { type Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Audience')
@Controller('audience')
export class AudianceController {
  constructor(private readonly audianceService: AudianceService) { }

  @Post('visitors')
  async createVisitor(@Body() createVisitorDto: CreateVisitorDto, @Req() req: any) {
    const origin = req.headers.origin || req.headers.referer;
    return this.audianceService.createVisitor(createVisitorDto, origin);
  }

  @Post('sessions')
  async createSession(@Body() createSessionDto: CreateSessionDto, @Req() req: any) {
    const origin = req.headers.origin || req.headers.referer;
    return this.audianceService.createSession(createSessionDto, origin);
  }

  @Post('page-views')
  async createPageView(@Body() createPageViewDto: CreatePageViewDto, @Req() req: any) {
    const origin = req.headers.origin || req.headers.referer;
    return this.audianceService.createPageView(createPageViewDto, origin);
  }

  @Post('page-events')
  async createPageEvent(@Body() createPageEventDto: CreatePageEventDto, @Req() req: any) {
    const origin = req.headers.origin || req.headers.referer;
    return this.audianceService.createPageEvent(createPageEventDto, origin);
  }

  @Get('visitors')
  async getVisitors(@Query() query: GetVisitorsDto, @User() user: any) { return this.audianceService.getVisitors(query, user); }

  @Get('visitors/:id')
  async getVisitor(@Param('id') id: string, @User() user: any) { return this.audianceService.getVisitor(parseInt(id), user); }

  @Get('sessions')
  async getSessions(@Query() query: GetSessionsDto, @User() user: any) { return this.audianceService.getSessions(query, user); }

  @Get('sessions/:id')
  async getSession(@Param('id') id: string, @User() user: any) { return this.audianceService.getSession(parseInt(id), user); }

  @Get('page-views')
  async getPageViews(@Query() query: GetPageViewsDto, @User() user: any) { return this.audianceService.getPageViews(query, user); }

  @Get('page-views/:id')
  async getPageView(@Param('id') id: string, @User() user: any) { return this.audianceService.getPageView(parseInt(id), user); }

  @Get('page-views/:resourceType/:resourceId')
  async getPageViewsByResource(@Param('resourceType') resourceType: string, @Param('resourceId') resourceId: string, @User() user: any) { return this.audianceService.getPageViewsByResource(resourceType, parseInt(resourceId)); }

  @Get('stats')
  @ApiOperation({ summary: 'Get audience stats' })
  async getAudienceStats(@Query() query: GetAudienceStatsDto, @User() user: any) { return this.audianceService.getAudienceStats(query, user); }

  @Get('daily-aggregates')
  @ApiOperation({ summary: 'Get daily aggregates' })
  async getDailyAggregates(@Query() query: GetAudienceStatsDto, @User() user: any) { return this.audianceService.getDailyAggregates(query, user); }

  @Get('export')
  async exportAudienceData(@Query('type') type: string, @Query('startDate') startDate: string, @Query('endDate') endDate: string, @User() user: any, @Res() res: Response) {
    const { buffer, filename } = await this.audianceService.exportAudienceData(type, startDate, endDate, user);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
  }
}