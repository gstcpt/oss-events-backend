import { Controller, Get, Param } from '@nestjs/common';
import { PublicPageFAQService } from './faq.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Public Page FAQ')
@Controller('public/faq')
export class PublicPageFAQController {
    constructor(private readonly publicPageFAQService: PublicPageFAQService) { }

    @Get(':origin')
    @ApiOperation({ summary: 'Get public page faq' })
    @ApiResponse({ status: 200, description: 'Public page faq retrieved successfully' })
    getPublicPageFAQ(@Param('origin') origin: string) { return this.publicPageFAQService.getPublicPageFAQ(origin); }
}