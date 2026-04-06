import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile, BadRequestException, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { User as UserDecorator } from "../../common/decorators/user.decorator";

@ApiTags('Companies')
@Controller("companies")
export class CompanyController {
    constructor(private readonly companyService: CompanyService) { }

    @Post()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('companies.create')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new company' })
    @ApiResponse({ status: 201, description: 'Company created successfully.' })
    createCompany(@Body() createCompanyDto: CreateCompanyDto, @Req() req: any) { return this.companyService.createCompany(createCompanyDto, req.user); }

    @Post('upload/logo')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('companies.logo.update')
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                try {
                    const companyId = req.body.companyId || 'company';
                    const uploadPath = join(process.cwd(), '..', 'frontend', 'public', 'images', 'companies', companyId.toString());
                    if (!existsSync(uploadPath)) { mkdirSync(uploadPath, { recursive: true }); }
                    cb(null, uploadPath);
                } catch (error) { cb(error, ''); }
            },
            filename: (req, file, cb) => { cb(null, 'logo.png'); },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) { return cb(new BadRequestException('Only image files are allowed'), false); }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 },
    }))
    async uploadLogo(@UploadedFile() file: Express.Multer.File, @Body('companyId') companyId: string, @Req() req: any) {
        try {
            if (!file) { throw new BadRequestException('No file uploaded'); }
            const logoUrl = `/images/companies/${companyId || 'company'}/logo.png`;
            if (companyId && companyId !== 'company') { await this.companyService.updateCompany(BigInt(companyId), { logo: logoUrl } as UpdateCompanyDto, req.user); }
            return { logoUrl };
        } catch (error) { throw new BadRequestException(`Upload failed: ${error.message}`); }
    }

    @Post('upload/favicon')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('companies.favicon.update')
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                try {
                    const companyId = req.body.companyId || 'company';
                    const uploadPath = join(process.cwd(), '..', 'frontend', 'public', 'images', 'companies', companyId.toString());
                    if (!existsSync(uploadPath)) { mkdirSync(uploadPath, { recursive: true }); }
                    cb(null, uploadPath);
                } catch (error) { cb(error, ''); }
            },
            filename: (req, file, cb) => { cb(null, 'favicon.ico'); },
        }),
        fileFilter: (req, file, cb) => {
            const mimetypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon'];
            if (!mimetypes.includes(file.mimetype)) { return cb(new BadRequestException('Only image or icon files are allowed'), false); }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 },
    }))
    async uploadFavicon(@UploadedFile() file: Express.Multer.File, @Body('companyId') companyId: string, @Req() req: any) {
        try {
            if (!file) { throw new BadRequestException('No file uploaded'); }
            const faviconUrl = `/images/companies/${companyId || 'company'}/favicon.ico`;
            if (companyId && companyId !== 'company') { await this.companyService.updateCompany(BigInt(companyId), { favicon: faviconUrl } as UpdateCompanyDto, req.user); }
            return { faviconUrl };
        } catch (error) { throw new BadRequestException(`Upload failed: ${error.message}`); }
    }

    @Get('public/url')
    @ApiOperation({ summary: "Get company by URL (Public)" })
    @ApiResponse({ status: 200, description: 'Company retrieved successfully.' })
    @ApiResponse({ status: 404, description: 'Company not found.' })
    findCompanyByUrlPublic(@Query('url') url: string) { return this.companyService.findCompanyByUrl(url); }

    @Get('public/:id')
    @ApiOperation({ summary: "Get company by ID (Public)" })
    @ApiResponse({ status: 200, description: 'Company retrieved successfully.' })
    @ApiResponse({ status: 404, description: 'Company not found.' })
    findCompanyByIdPublic(@Param('id') id: string) { return this.companyService.findCompanyById(BigInt(id)); }

    @Get(":id")
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Get company by ID" })
    @ApiResponse({ status: 200, description: 'Company retrieved successfully.' })
    @ApiResponse({ status: 404, description: 'Company not found.' })
    findCompanyById(@Param('id') id: string) { return this.companyService.findCompanyById(BigInt(id)); }

    @Get()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all companies' })
    @ApiResponse({ status: 200, description: "List of companies retrieved successfully." })
    findAllCompanies(@UserDecorator() user: any) { return this.companyService.findAllCompanies(user); }

    @Get('count-all')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get count of all companies' })
    @ApiResponse({ status: 200, description: "Count of all companies retrieved successfully." })
    countAllCompanies() { return this.companyService.countAllCompanies(); }

    @Get("company/:id/userId")
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Get company by user ID" })
    @ApiResponse({ status: 200, description: 'Company retrieved successfully.' })
    @ApiResponse({ status: 404, description: 'Company not found.' })
    findCompanyByUserId(@Param('id') id: number) { return this.companyService.findCompanyByUserId(id); }

    @Get('company/:status/status')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Get companies by status" })
    @ApiResponse({ status: 200, description: 'Companies retrieved successfully.' })
    @ApiResponse({ status: 404, description: 'Companies not found.' })
    findAllCompanyByStatus(@Param('status') status: number) { return this.companyService.findAllCompanyByStatus(status); }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('companies.update')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update company by ID' })
    @ApiResponse({ status: 200, description: 'Company updated successfully.' })
    @ApiResponse({ status: 404, description: 'Company not found.' })
    updateCompany(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto, @Req() req: any) { return this.companyService.updateCompany(BigInt(id), updateCompanyDto, req.user); }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('companies.delete')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete company by ID' })
    @ApiResponse({ status: 200, description: 'Company deleted successfully.' })
    @ApiResponse({ status: 404, description: 'Company not found.' })
    removeCompany(@Param('id') id: string, @Req() req: any) { return this.companyService.removeCompany(BigInt(id), req.user); }
}