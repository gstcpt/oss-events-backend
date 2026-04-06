import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, Res } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { UpdateNewsletterDto } from './dto/update-newsletter.dto';
import { User } from '../../common/decorators/user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@Controller('newsletter')
export class NewsletterController {
    constructor(private readonly newsletterService: NewsletterService) { }

    @Post()
    async createNewsletter(@Body() createNewsletterDto: CreateNewsletterDto, @Req() req: any) {
        const origin = req.headers.origin || req.headers.referer;
        const result = await this.newsletterService.create(createNewsletterDto, origin);
        if ('success' in result) { return result; } else { return { success: false, error: 'Failed to create newsletter subscription' }; }
    }

    @Get()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    async getAllNewsletters(@Query() query: any, @User() user: any) {
        const result = await this.newsletterService.findAll(query, user);
        if ('success' in result) { return result; } else { return { success: false, error: 'Failed to fetch newsletters' }; }
    }

    @Get('stats')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    async getNewsletterStats(@User() user: any) {
        const result = await this.newsletterService.getStats(user);
        if ('success' in result) { return result; } else { return { success: false, error: 'Failed to fetch newsletter statistics' }; }
    }

    @Get('export')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    async exportNewsletters(@Query() query: any, @User() user: any, @Res() res: any) {
        const result = await this.newsletterService.exportToCsv(query, user);
        if ('success' in result && result.success && result.csvData) {
            res.header('Content-Type', 'text/csv');
            res.header('Content-Disposition', 'attachment; filename="newsletter_subscribers.csv"');
            res.send(result.csvData);
        } else { res.status(400).json({ success: false, error: 'Failed to export newsletter data' }); }
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    async getNewsletter(@Param('id') id: string, @User() user: any) {
        const result = await this.newsletterService.findOne(BigInt(id), user);
        if ('success' in result) { return result; } else { return { success: false, error: 'Failed to fetch newsletter subscription' }; }
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('newsletter.update')
    async updateNewsletter(@Param('id') id: string, @Body() updateNewsletterDto: UpdateNewsletterDto, @User() user: any) {
        const result = await this.newsletterService.update(BigInt(id), updateNewsletterDto, user);
        if ('success' in result) { return result; } else { return { success: false, error: 'Failed to update newsletter subscription' }; }
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('newsletter.delete')
    async deleteNewsletter(@Param('id') id: string, @User() user: any) {
        const result = await this.newsletterService.remove(BigInt(id), user);
        if ('success' in result) { return result; } else { return { success: false, error: 'Failed to delete newsletter subscription' }; }
    }

}