import { Controller, Get, Param } from '@nestjs/common';
import { PublicPageTermsConditionsService } from './terms-conditions.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Public Page Terms Conditions')
@Controller('public/terms-conditions')
export class PublicPageTermsConditionsController {
    constructor(private readonly publicPageTermsConditionsService: PublicPageTermsConditionsService) { }

    @Get(':origin')
    @ApiOperation({ summary: 'Get public page terms conditions' })
    @ApiResponse({ status: 200, description: 'Public page terms conditions retrieved successfully' })
    getPublicPageTermsConditions(@Param('origin') origin: string) { return this.publicPageTermsConditionsService.getPublicPageTermsConditions(origin); }
}