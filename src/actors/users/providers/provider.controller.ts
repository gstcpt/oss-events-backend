import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProviderService } from './provider.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { UploadService, providerLogoMulterConfig } from '../../../upload/upload.service';

@ApiTags('Providers')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('providers')
export class ProviderController {
  constructor(private readonly providerService: ProviderService, private readonly uploadService: UploadService) { }

  @Post()
  @RequirePermissions('providers.create')
  @ApiOperation({ summary: 'Create a new provider' })
  @ApiResponse({ status: 201, description: 'Provider created successfully.' })
  create(@Body() createProviderDto: CreateProviderDto, @Req() req: any) { return this.providerService.create(createProviderDto, req.user); }

  @Post('upload/logo')
  @RequirePermissions('providers.logo.update')
  @UseInterceptors(FileInterceptor('logo', providerLogoMulterConfig))
  @ApiOperation({ summary: 'Upload provider logo' })
  @ApiResponse({ status: 201, description: 'Logo uploaded successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid file.' })
  async uploadLogo(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) { throw new BadRequestException('No file uploaded'); }
    if (process.env.VERCEL) {
      return { url: `/images/providers/${file.filename}` };
    }
    try {
      const uploadedFile = this.uploadService.uploadProviderLogo(file);
      return uploadedFile;
    } catch (error) {
      console.error('Logo upload error:', error);
      throw new BadRequestException('Failed to upload logo. Storage not available on this server.');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all providers' })
  @ApiResponse({ status: 200, description: 'Providers retrieved successfully.' })
  getAll(@Req() req: any) { return this.providerService.getAll(req.user); }

  @Get(':id')
  @ApiOperation({ summary: 'Get provider by ID' })
  @ApiResponse({ status: 200, description: 'Provider retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Provider not found.' })
  getOne(@Param('id') id: number, @Req() req: any) { return this.providerService.getOne(id); }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get provider by User ID' })
  @ApiResponse({ status: 200, description: 'Provider retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Provider not found.' })
  getOneByUserId(@Param('userId') userId: number, @Req() req: any) { return this.providerService.getOneByUserId(userId); }

  @Patch(':id')
  @RequirePermissions('providers.update')
  @ApiOperation({ summary: 'Update provider by ID' })
  @ApiResponse({ status: 200, description: 'Provider updated successfully.' })
  @ApiResponse({ status: 404, description: 'Provider not found.' })
  update(@Param('id') id: number, @Body() updateProviderDto: UpdateProviderDto, @Req() req: any) { return this.providerService.update(id, updateProviderDto, req.user); }

  @Patch(':id/opening-hours')
  @RequirePermissions('providers.opening.hours.update')
  @ApiOperation({ summary: 'Update provider opening hours' })
  @ApiResponse({ status: 200, description: 'Opening hours updated successfully.' })
  updateOpeningHours(@Param('id') id: string, @Body() hours: any[]) { return this.providerService.updateOpeningHours(BigInt(id), hours); }

  @Patch(':id/exceptions')
  @RequirePermissions('providers.exceptions.update')
  @ApiOperation({ summary: 'Update provider opening exceptions' })
  @ApiResponse({ status: 200, description: 'Exceptions updated successfully.' })
  updateExceptions(@Param('id') id: string, @Body() exceptions: any[]) { return this.providerService.updateExceptions(BigInt(id), exceptions); }

  @Delete(':id')
  @RequirePermissions('providers.delete')
  @ApiOperation({ summary: 'Delete provider by ID' })
  @ApiResponse({ status: 200, description: 'Provider deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Provider not found.' })
  delete(@Param('id') id: number, @Req() req: any) { return this.providerService.delete(id, req.user); }
}