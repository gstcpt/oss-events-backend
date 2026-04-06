import { Controller, Get, Delete, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LogService } from './log.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Logs')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService) { }

  @Get('')
  @ApiOperation({ summary: 'Get all logs' })
  @ApiResponse({ status: 200, description: 'Logs loaded successfully.' })
  getLogs(@Request() req, @Query('companyId') companyId?: string) {
    const selectedCompanyId = companyId ? parseInt(companyId) : undefined;
    return this.logService.getLogs(req.user, selectedCompanyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a log' })
  @ApiResponse({ status: 200, description: 'Log deleted successfully.' })
  deleteLog(@Param('id') id: string) { return this.logService.deleteLog(+id); }
}