import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { InteractionsService, type TargetType } from '../services/interactions.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Interactions')
@Controller('interactions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class InteractionsController {
    constructor(private readonly interactionsService: InteractionsService) { }

    @Get('favorites')
    @ApiOperation({ summary: 'Get user favorites' })
    @ApiResponse({ status: 200, description: 'Favorites retrieved successfully' })
    @ApiQuery({ name: 'targetType', required: false, enum: ['ITEM', 'BLOG', 'PROVIDER', 'CATEGORY'] })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    async getFavorites(@Req() req: any, @Query('targetType') targetType?: TargetType, @Query('page') page = 1, @Query('limit') limit = 20) { return this.interactionsService.getUserFavorites(Number(req.user.id), targetType, Number(page), Number(limit)); }
}