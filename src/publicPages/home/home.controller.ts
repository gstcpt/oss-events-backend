import { Controller, Get, Post, Req, Headers, Body } from '@nestjs/common';
import { PublicPageHomeService } from './home.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

@ApiTags('Public Page Home')
@Controller('public/home')
export class PublicPageHomeController {
    constructor(private readonly publicPageHomeService: PublicPageHomeService) { }
    private getOriginFromRequest(req: Request, originHeader?: string): string {
        if (originHeader) {
            const cleanOrigin = originHeader.replace(/^https?:\/\//, '');
            if (cleanOrigin === 'localhost' || cleanOrigin.startsWith('localhost:')) { return 'localhost'; }
            return cleanOrigin;
        }
        const host = req.headers.host;
        if (host) {
            const cleanHost = host.replace(/:\d+$/, '');
            if (cleanHost === 'localhost' || cleanHost.startsWith('localhost:')) { return 'localhost'; }
            return cleanHost;
        }
        return req.hostname || 'localhost';
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get public page home stats' })
    @ApiResponse({ status: 200, description: 'Public page home stats retrieved successfully' })
    getHomePageStats(@Req() req: Request, @Headers('origin') origin?: string) {
        const url = this.getOriginFromRequest(req, origin);
        return this.publicPageHomeService.getHomePageStats(url);
    }

    @Get('categories')
    @ApiOperation({ summary: 'Get public page categories' })
    @ApiResponse({ status: 200, description: 'Public page categories retrieved successfully' })
    getCategories(@Req() req: Request, @Headers('origin') origin?: string) {
        const url = this.getOriginFromRequest(req, origin);
        return this.publicPageHomeService.getCategories(url);
    }

    @Get('providers')
    @ApiOperation({ summary: 'Get public page providers' })
    @ApiResponse({ status: 200, description: 'Public page providers retrieved successfully' })
    getProviders(@Req() req: Request, @Headers('origin') origin?: string, @Req() reqQuery?: any) {
        const url = this.getOriginFromRequest(req, origin);
        const userId = reqQuery?.query?.userId ? Number(reqQuery.query.userId) : undefined;
        return this.publicPageHomeService.getProviders(url, userId);
    }

    @Get('blogs')
    @ApiOperation({ summary: 'Get public page blogs' })
    @ApiResponse({ status: 200, description: 'Public page blogs retrieved successfully' })
    getBlogs(@Req() req: Request, @Headers('origin') origin?: string) {
        const url = this.getOriginFromRequest(req, origin);
        return this.publicPageHomeService.getBlogs(url);
    }

    @Get('audience-stats')
    @ApiOperation({ summary: 'Get audience statistics' })
    @ApiResponse({ status: 200, description: 'Audience statistics retrieved successfully' })
    getAudienceStats(@Req() req: Request, @Headers('origin') origin?: string) {
        const url = this.getOriginFromRequest(req, origin);
        return this.publicPageHomeService.getAudienceStats(url);
    }

    @Get('items')
    @ApiOperation({ summary: 'Get public page items' })
    @ApiResponse({ status: 200, description: 'Public page items retrieved successfully' })
    getItems(@Req() req: Request, @Headers('origin') origin?: string, @Req() reqQuery?: any) {
        const url = this.getOriginFromRequest(req, origin);
        const userId = reqQuery?.query?.userId ? Number(reqQuery.query.userId) : undefined;
        return this.publicPageHomeService.getItems(url, userId);
    }

    @Get('company')
    @ApiOperation({ summary: 'Get public page company' })
    @ApiResponse({ status: 200, description: 'Public page company retrieved successfully' })
    getCompany(@Req() req: Request, @Headers('origin') origin?: string) {
        const url = this.getOriginFromRequest(req, origin);
        return this.publicPageHomeService.getPublicPageHome(url);
    }

    @Post('newsletter')
    @ApiOperation({ summary: 'Subscribe to newsletter' })
    @ApiResponse({ status: 200, description: 'Successfully subscribed to newsletter' })
    @ApiResponse({ status: 400, description: 'Invalid email or already subscribed' })
    async subscribeToNewsletter(@Req() req: Request, @Body() body: { email: string }, @Headers('origin') origin?: string) {
        try {
            const url = this.getOriginFromRequest(req, origin);
            const company = await this.publicPageHomeService.getPublicPageHome(url);
            const newsletterData = { email: body.email, company_id: company.id };
            const result = await this.publicPageHomeService.createNewslatter(newsletterData);
            return result;
        } catch (error) { throw error; }
    }
}