import { Injectable, Scope, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { LogService } from '../../../common/services/log.service';

@Injectable({ scope: Scope.REQUEST })
export class ProviderService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logService: LogService
    ) { }
    private convertBigIntToNumber(obj: any): any {
        if (obj === null || obj === undefined) { return obj; }
        if (typeof obj === 'bigint') { return Number(obj); }
        if (obj instanceof Date) { return obj; }
        if (Array.isArray(obj)) { return obj.map(item => this.convertBigIntToNumber(item)); }
        if (typeof obj === 'object') {
            const result: any = {};
            for (const key in obj) { result[key] = this.convertBigIntToNumber(obj[key]); }
            return result;
        }
        return obj;
    }
    async create(createProviderDto: CreateProviderDto, currentUser: any) {
        try {
            const provider_info = await this.prisma.client.provider_info.create({ data: createProviderDto as any });
            await this.logService.createLogForUserAction(Number(currentUser.id), 'provider_info', Number(provider_info.id), 'create', `Provider info created: ${provider_info.ste_title}, email: ${provider_info.email} and phone number: ${provider_info.phone_number}`);
            return this.convertBigIntToNumber(provider_info);
        }
        catch (error) { throw new BadRequestException('Error creating providers: ' + error.message); }
    }
    async getAll(currentUser: any) {
        try {
            if (currentUser.role !== 'Root') {
                const providers = await this.prisma.client.users.findMany({ where: { company_id: currentUser.company_id } });
                const result = await this.prisma.client.provider_info.findMany({ where: { id: { in: providers.map(provider => provider.id) } }, include: { provider_opening_hour: true, provider_opening_exception: true } });
                return this.convertBigIntToNumber(result);
            }
            else {
                const result = await this.prisma.client.provider_info.findMany({ include: { provider_opening_hour: true, provider_opening_exception: true } });
                return this.convertBigIntToNumber(result);
            }
        }
        catch (error) { throw new BadRequestException('Error getting providers info: ' + error.message); }
    }
    async getOne(id: number) {
        try {
            const result = await this.prisma.client.provider_info.findFirst({ where: { id: BigInt(id) }, include: { provider_opening_hour: true, provider_opening_exception: true } });
            return this.convertBigIntToNumber(result);
        } catch (error) { throw new BadRequestException('Error getting provider info: ' + error.message); }
    }
    async getOneByUserId(userId: number) {
        try {
            const result = await this.prisma.client.provider_info.findFirst({
                where: { user_id: BigInt(userId) },
                include: {
                    countries: true,
                    governorates: true,
                    municipalities: true,
                    provider_opening_hour: true,
                    provider_opening_exception: true
                }
            });
            return this.convertBigIntToNumber(result);
        } catch (error) {
            throw new BadRequestException('Error getting provider info: ' + error.message);
        }
    }

    async updateOpeningHours(providerId: number | bigint, hours: any[]) {
        try {
            const pId = BigInt(providerId);
            // Delete existing?
            // User requirement: "manage opening hours". Usually replacement of schedule.
            await this.prisma.client.provider_opening_hour.deleteMany({ where: { providerId: pId } });

            const newHours = hours.map(h => ({
                providerId: pId,
                dayOfWeek: Number(h.dayOfWeek),
                startTime: new Date(h.startTime), // Check if parsing needed
                endTime: new Date(h.endTime),
                isActive: h.isActive
            }));
            const created = await this.prisma.client.provider_opening_hour.createMany({ data: newHours });
            return { message: "Opening hours updated", count: created.count };
        } catch (error) {
            throw new BadRequestException("Error updating opening hours: " + error.message);
        }
    }

    async updateExceptions(providerId: number | bigint, exceptions: any[]) {
        try {
            const pId = BigInt(providerId);
            // Full replacement strategy for simplicity or nuanced generic update? 
            // "Manage" implies add/edit/delete.
            // If API sends full list, full replacement is safest.
            await this.prisma.client.provider_opening_exception.deleteMany({ where: { providerId: pId } });

            const newExceptions = exceptions.map(e => ({
                providerId: pId,
                date: new Date(e.date),
                startTime: e.startTime ? new Date(e.startTime) : null,
                endTime: e.endTime ? new Date(e.endTime) : null,
                isClosed: e.isClosed,
                note: e.note
            }));
            const created = await this.prisma.client.provider_opening_exception.createMany({ data: newExceptions });
            return { message: "Exceptions updated", count: created.count };
        } catch (error) { throw new BadRequestException("Error updating exceptions: " + error.message); }
    }

    async update(id: number, updateProviderDto: UpdateProviderDto, currentUser: any) {
        try {
            const idBig = BigInt(id);
            const provider_info = await this.prisma.client.provider_info.findFirst({ where: { id: idBig } });
            if (!provider_info) { throw new BadRequestException('Provider not found or you do not have permission to update it.'); }
            const transformedData: any = { ...updateProviderDto };
            if (transformedData.phone && !transformedData.phone_number) {
                transformedData.phone_number = transformedData.phone;
                delete transformedData.phone;
            }
            const providerToUpdate = await this.prisma.client.provider_info.update({ where: { id: idBig }, data: transformedData as any });
            if (!providerToUpdate) { throw new BadRequestException('Update failed - no record returned'); }
            if (currentUser && currentUser.id) {
                await this.logService.createLogForUserAction(Number(currentUser.id), 'provider_info', Number(providerToUpdate.id), 'update', `Provider info updated: ${providerToUpdate.ste_title}, email: ${providerToUpdate.email} and phone number: ${providerToUpdate.phone_number}`);
            }
            return this.convertBigIntToNumber(providerToUpdate);
        }
        catch (error) { throw new BadRequestException('Error updating provider info: ' + error.message); }
    }
    async delete(id: number, currentUser: any) {
        try {
            const idBig = BigInt(id);
            const provider_info = await this.prisma.client.provider_info.findFirst({ where: { id: idBig } });
            if (!provider_info) { throw new BadRequestException('Provider not found or you do not have permission to delete it.'); }
            const providerToDelete = await this.prisma.client.provider_info.delete({ where: { id: idBig } });
            await this.logService.createLogForUserAction(Number(currentUser.id), 'provider_info', Number(provider_info.id), 'delete', `Provider info deleted: ${provider_info.ste_title}, email: ${provider_info.email} and phone number: ${provider_info.phone_number}`);
            return this.convertBigIntToNumber(providerToDelete);
        }
        catch (error) { throw new BadRequestException('Error deleting provider info: ' + error.message); }
    }
}