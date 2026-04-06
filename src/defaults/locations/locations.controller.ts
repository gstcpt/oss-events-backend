import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LocationService } from './locations.service';
import { CreateCountryDto, CreateGovernorateDto, CreateMunicipalityDto } from './dto/create-location.dto';
import { UpdateCountryDto, UpdateGovernorateDto, UpdateMunicipalityDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@ApiTags('Locations')
@ApiResponse({ status: 400, description: 'Invalid input.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 403, description: 'Forbidden.' })
@Controller('locations')
export class LocationController {
    constructor(private readonly locationService: LocationService) { }
    @Post('countries')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('country.create')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new country' })
    createCountry(@Body() createCountryDto: CreateCountryDto, @Req() req: any) { return this.locationService.createCountry(createCountryDto, req.user); }

    @Post('governorates')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('governorate.create')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new governorate' })
    createGovernorate(@Body() createGovernorateDto: CreateGovernorateDto, @Req() req: any) { return this.locationService.createGovernorate(createGovernorateDto, req.user); }

    @Post('municipalities')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('municipality.create')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new municipality' })
    createMunicipality(@Body() createMunicipalityDto: CreateMunicipalityDto, @Req() req: any) { return this.locationService.createMunicipality(createMunicipalityDto, req.user); }

    @Get('countries')
    @ApiOperation({ summary: 'Get all countries' })
    getAllCountries() { return this.locationService.getAllCountries(); }

    @Get('countries/:id')
    @ApiOperation({ summary: 'Get a country by ID' })
    getCountryById(@Param('id') id: number) { return this.locationService.getCountryById(id); }

    @Get('governorates')
    @ApiOperation({ summary: 'Get all governorates' })
    getAllGovernorates() { return this.locationService.getAllGovernorates(); }

    @Get('governorates/country/:id')
    @ApiOperation({ summary: 'Get governorates by country ID' })
    getGovernoratesByCountryId(@Param('id') id: string) { return this.locationService.getGovernoratesByCountryId(Number(id)); }

    @Get('governorates/:id')
    @ApiOperation({ summary: 'Get a governorate by ID' })
    getGovernorateById(@Param('id') id: string) { return this.locationService.getGovernorateById(Number(id)); }

    @Get('municipalities')
    @ApiOperation({ summary: 'Get all municipalities' })
    getAllMunicipalities() { return this.locationService.getAllMunicipalities(); }

    @Get('municipalities/:id')
    @ApiOperation({ summary: 'Get a municipality by ID' })
    getMunicipalityById(@Param('id') id: string) { return this.locationService.getMunicipalityById(Number(id)); }

    @Get('municipalities/governorate/:id')
    @ApiOperation({ summary: 'Get municipalities by governorate ID' })
    getMunicipalitiesByGovernorateId(@Param('id') id: string) { return this.locationService.getMunicipalitiesByGovernorateId(Number(id)); }

    @Patch('countries/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('country.update')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a country by ID' })
    updateCountry(@Param('id') id: string, @Body() updateCountryDto: UpdateCountryDto, @Req() req: any) { return this.locationService.updateCountry(Number(id), updateCountryDto, req.user); }

    @Patch('governorates/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('governorate.update')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a governorate by ID' })
    updateGovernorate(@Param('id') id: string, @Body() updateGovernorateDto: UpdateGovernorateDto, @Req() req: any) { return this.locationService.updateGovernorate(Number(id), updateGovernorateDto, req.user); }

    @Patch('municipalities/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('municipality.update')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a municipality by ID' })
    updateMunicipality(@Param('id') id: string, @Body() updateMunicipalityDto: UpdateMunicipalityDto, @Req() req: any) { return this.locationService.updateMunicipality(Number(id), updateMunicipalityDto, req.user); }

    @Delete('countries/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('country.delete')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a country by ID' })
    deleteCountry(@Param('id') id: string, @Req() req: any) { return this.locationService.deleteCountry(Number(id), req.user); }

    @Delete('governorates/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('governorate.delete')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a governorate by ID' })
    deleteGovernorate(@Param('id') id: string, @Req() req: any) { return this.locationService.deleteGovernorate(Number(id), req.user); }

    @Delete('municipalities/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('municipality.delete')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a municipality by ID' })
    deleteMunicipality(@Param('id') id: string, @Req() req: any) { return this.locationService.deleteMunicipality(Number(id), req.user); }
}