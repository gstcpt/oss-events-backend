import { Controller, Get, Param } from '@nestjs/common';
import { PublicPagePrivacyPolicyService } from './privacy-policy.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Public Page Privacy Policy')
@Controller('public/privacy-policy')
export class PublicPagePrivacyPolicyController {
    constructor(private readonly publicPagePrivacyPolicyService: PublicPagePrivacyPolicyService) { }

    @Get(':origin')
    @ApiOperation({ summary: 'Get public page privacy policy' })
    @ApiResponse({ status: 200, description: 'Public page privacy policy retrieved successfully' })
    getPublicPagePrivacyPolicy(@Param('origin') origin: string) { return this.publicPagePrivacyPolicyService.getPublicPagePrivacyPolicy(origin); }
}