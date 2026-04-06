import { Controller, Get, Query } from '@nestjs/common';
import { PublicPageContactService } from './contact.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Public Page Contact')
@Controller('public/contact')
@ApiBearerAuth()
export class PublicPageContactController {
    constructor(private readonly publicPageContactService: PublicPageContactService) { }

    @Get()
    @ApiOperation({ summary: 'Get public page contact' })
    @ApiResponse({ status: 200, description: 'Public page contact retrieved successfully' })
    getPublicPageContact(@Query('url') url: string) { return this.publicPageContactService.getPublicPageContact(url); }
}