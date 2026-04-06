import { Controller, Get, Req } from '@nestjs/common';
import { PublicPageAboutService } from './about.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Public Page About')
@Controller('public/about')
export class PublicPageAboutController {
    constructor(private readonly publicPageAboutService: PublicPageAboutService) { }

    @Get()
    @ApiOperation({ summary: 'Get public page about' })
    @ApiResponse({ status: 200, description: 'Public page about retrieved successfully' })
    getPublicPageAbout(@Req() req: any) {
        const origin = req.headers.origin || req.headers.host;
        return this.publicPageAboutService.getPublicPageAbout(origin);
    }
}