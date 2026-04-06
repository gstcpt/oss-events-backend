import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService, logoMulterConfig, categoryMulterConfig, fileMulterConfig } from './upload.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post('logo')
  @ApiOperation({ summary: 'Upload logo' })
  @ApiResponse({ status: 201, description: 'Logo uploaded successfully' })
  @UseInterceptors(FileInterceptor('file', logoMulterConfig))
  async uploadLogo(@UploadedFile() file: Express.Multer.File, @Body('companyId') companyId: string, @Body('companyName') companyName: string) { return this.uploadService.uploadLogo(file); }

  @Post('category')
  @ApiOperation({ summary: 'Upload category image' })
  @ApiResponse({ status: 201, description: 'Category image uploaded successfully' })
  @UseInterceptors(FileInterceptor('file', categoryMulterConfig))
  async uploadCategory(@UploadedFile() file: Express.Multer.File, @Body('categoryId') categoryId: string, @Body('categoryTitle') categoryTitle: string) { try { return this.uploadService.uploadCategory(file); } catch (error) { throw error; } }

  @Post('file')
  @ApiOperation({ summary: 'Upload file' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @UseInterceptors(FileInterceptor('file', fileMulterConfig))
  async uploadFile(@UploadedFile() file: Express.Multer.File) { try { return this.uploadService.uploadFile(file); } catch (error) { throw error; } }
}