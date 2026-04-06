import { Injectable, Scope, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCountryDto, CreateGovernorateDto, CreateMunicipalityDto } from './dto/create-location.dto';
import { UpdateCountryDto, UpdateGovernorateDto, UpdateMunicipalityDto } from './dto/update-location.dto';
import { LogService } from '../../common/services/log.service';

@Injectable({ scope: Scope.REQUEST })
export class LocationService {
    constructor(private prisma: PrismaService, private logService: LogService) { }
    async createCountry(createCountryDto: CreateCountryDto, currentUser: any) {
        try {
            const country = await this.prisma.client.countries.create({ data: createCountryDto });
            await this.logService.createLogForUserAction(Number(currentUser.id), 'countries', Number(country.id), 'create', `Country created: ${country.name}`);
            return { success: true, data: country, message: 'Country created successfully' };
        } catch (error) { throw new BadRequestException('Error creating new country: ' + error.message); }
    }
    async getAllCountries() {
        try {
            const countries = await this.prisma.client.countries.findMany({ include: { governorates: { include: { municipalities: true } } } });
            return { success: true, data: countries };
        } catch (error) { throw new BadRequestException('Error in getting list of Countries: ' + error.message); }
    }
    async getCountryById(countryId: number) {
        try {
            const country = await this.prisma.client.countries.findUnique({ where: { id: countryId }, include: { governorates: { include: { municipalities: true } } } });
            if (!country) { throw new BadRequestException('Country not found'); }
            return { success: true, data: country };
        } catch (error) { throw new BadRequestException('Error getting country by ID: ' + error.message); }
    }
    async updateCountry(countryId: number, updateCountryDto: UpdateCountryDto, currentUser: any) {
        try {
            const country = await this.prisma.client.countries.update({ where: { id: countryId }, data: updateCountryDto });
            await this.logService.createLogForUserAction(Number(currentUser.id), 'countries', Number(country.id), 'update', `Country updated: ${country.name}`);
            return { success: true, data: country, message: 'Country updated successfully' };
        } catch (error) { throw new BadRequestException('Error updating country: ' + error.message); }
    }
    async deleteCountry(countryId: number, currentUser: any) {
        try {
            const country = await this.prisma.client.countries.delete({ where: { id: countryId } });
            await this.logService.createLogForUserAction(Number(currentUser.id), 'countries', Number(country.id), 'delete', `Country deleted: ${country.name}`);
            return { success: true, message: 'Country deleted successfully' };
        } catch (error) { throw new BadRequestException('Error deleting country: ' + error.message); }
    }
    async createGovernorate(createGovernorateDto: CreateGovernorateDto, currentUser: any) {
        try {
            const governorate = await this.prisma.client.governorates.create({ data: { name: createGovernorateDto.name, country_id: createGovernorateDto.country_id }, include: { countries: true, municipalities: true } });
            await this.logService.createLogForUserAction(Number(currentUser.id), 'governorates', Number(governorate.id), 'create', `Governorate created: ${governorate.name}`);
            return { success: true, data: governorate, message: 'Governorate created successfully' };
        } catch (error) { throw new BadRequestException('Error creating new governorate: ' + error.message); }
    }
    async getAllGovernorates() {
        try {
            const governorates = await this.prisma.client.governorates.findMany({ include: { countries: true, municipalities: true } });
            return { success: true, data: governorates };
        } catch (error) { throw new BadRequestException('Error in getting list of Governorates: ' + error.message); }
    }
    async getGovernorateById(governorateId: number) {
        try {
            const governorate = await this.prisma.client.governorates.findUnique({ where: { id: governorateId }, include: { countries: true, municipalities: true } });
            if (!governorate) { throw new BadRequestException('Governorate not found'); }
            return { success: true, data: governorate };
        } catch (error) { throw new BadRequestException('Error getting governorate by ID: ' + error.message); }
    }
    async getGovernoratesByCountryId(countryId: number) {
        try {
            const governorates = await this.prisma.client.governorates.findMany({ where: { country_id: countryId }, include: { countries: true, municipalities: true } });
            return { success: true, data: governorates };
        } catch (error) { throw new BadRequestException('Error in getting list of Governorates by country ID: ' + error.message); }
    }
    async updateGovernorate(governorateId: number, updateGovernorateDto: UpdateGovernorateDto, currentUser: any) {
        try {
            const governorate = await this.prisma.client.governorates.update({ where: { id: governorateId }, data: { name: updateGovernorateDto.name, country_id: updateGovernorateDto.country_id }, include: { countries: true, municipalities: true } });
            await this.logService.createLogForUserAction(Number(currentUser.id), 'governorates', Number(governorate.id), 'update', `Governorate updated: ${governorate.name}`);
            return { success: true, data: governorate, message: 'Governorate updated successfully' };
        } catch (error) { throw new BadRequestException('Error updating governorate: ' + error.message); }
    }
    async deleteGovernorate(governorateId: number, currentUser: any) {
        try {
            const governorate = await this.prisma.client.governorates.delete({ where: { id: governorateId } });
            await this.logService.createLogForUserAction(Number(currentUser.id), 'governorates', Number(governorate.id), 'delete', `Governorate deleted: ${governorate.name}`);
            return { success: true, message: 'Governorate deleted successfully' };
        } catch (error) { throw new BadRequestException('Error deleting governorate: ' + error.message); }
    }
    async createMunicipality(createMunicipalityDto: CreateMunicipalityDto, currentUser: any) {
        try {
            const municipality = await this.prisma.client.municipalities.create({ data: { name: createMunicipalityDto.name, code: createMunicipalityDto.code, governorate_id: createMunicipalityDto.governorate_id }, include: { governorates: { include: { countries: true } } } });
            await this.logService.createLogForUserAction(Number(currentUser.id), 'municipalities', Number(municipality.id), 'create', `Municipality created: ${municipality.name}`);
            return { success: true, data: municipality, message: 'Municipality created successfully' };
        } catch (error) { throw new BadRequestException('Error creating new municipality: ' + error.message); }
    }
    async getAllMunicipalities() {
        try {
            const municipalities = await this.prisma.client.municipalities.findMany({ include: { governorates: { include: { countries: true } } } });
            return { success: true, data: municipalities };
        } catch (error) { throw new BadRequestException('Error in getting list of Municipalities: ' + error.message); }
    }
    async getMunicipalityById(municipalityId: number) {
        try {
            const municipality = await this.prisma.client.municipalities.findUnique({ where: { id: municipalityId }, include: { governorates: { include: { countries: true } } } });
            if (!municipality) { throw new BadRequestException('Municipality not found'); }
            return { success: true, data: municipality };
        } catch (error) { throw new BadRequestException('Error getting municipality by ID: ' + error.message); }
    }
    async getMunicipalitiesByGovernorateId(governorateId: number) {
        try {
            const municipalities = await this.prisma.client.municipalities.findMany({ where: { governorate_id: governorateId }, include: { governorates: { include: { countries: true } } } });
            return { success: true, data: municipalities };
        } catch (error) { throw new BadRequestException('Error in getting list of Municipalities by governorate ID: ' + error.message); }
    }
    async updateMunicipality(municipalityId: number, updateMunicipalityDto: UpdateMunicipalityDto, currentUser: any) {
        try {
            const municipality = await this.prisma.client.municipalities.update({ where: { id: municipalityId }, data: { name: updateMunicipalityDto.name, code: updateMunicipalityDto.code, governorate_id: updateMunicipalityDto.governorate_id }, include: { governorates: { include: { countries: true } } } });
            await this.logService.createLogForUserAction(Number(currentUser.id), 'municipalities', Number(municipality.id), 'update', `Municipality updated: ${municipality.name}`);
            return { success: true, data: municipality, message: 'Municipality updated successfully' };
        } catch (error) { throw new BadRequestException('Error updating municipality: ' + error.message); }
    }
    async deleteMunicipality(municipalityId: number, currentUser: any) {
        try {
            const municipality = await this.prisma.client.municipalities.delete({ where: { id: municipalityId } });
            await this.logService.createLogForUserAction(Number(currentUser.id), 'municipalities', Number(municipality.id), 'delete', `Municipality deleted: ${municipality.name}`);
            return { success: true, message: 'Municipality deleted successfully' };
        } catch (error) { throw new BadRequestException('Error deleting municipality: ' + error.message); }
    }
}