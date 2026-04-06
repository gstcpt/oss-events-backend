import { Controller, Get, Req } from '@nestjs/common';
import { PublicPageCreateEventsService } from './createEvents.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Public Page Create Events')
@Controller('public/createEvents')
export class PublicPageCreateEventsController {
    constructor(private readonly publicPageCreateEventsService: PublicPageCreateEventsService) { }

    @Get()
    @ApiOperation({ summary: 'Get public page create events' })
    @ApiResponse({ status: 200, description: 'Public page create events retrieved successfully' })
    getPublicPageCreateEvents(@Req() req: any) {
        const origin = req.headers.origin || req.headers.host;
        return this.publicPageCreateEventsService.getPublicPageCreateEvents(origin);
    }
}