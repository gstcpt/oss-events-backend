import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateTermsConditionsDto } from './dto/create-terms-conditions.dto';
import { UpdateTermsConditionsDto } from './dto/update-terms-conditions.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { LogService } from '../../common/services/log.service';

@Injectable()
export class TermsConditionsService {
    constructor(private prisma: PrismaService, private logService: LogService) { }
    async createTermsConditions(createTermsConditionsDto: CreateTermsConditionsDto, currentUser: number) {
        try {
            const user = await this.prisma.client.users.findUnique({ where: { id: Number(currentUser) } });
            if (!user) { throw new BadRequestException('User not found'); }
            const companyId = user.role_id?.toString() === '1' ? createTermsConditionsDto.companyId : user.company_id;
            if (!companyId) { throw new BadRequestException('Company ID is required'); }
            let terms = await this.prisma.client.terms_conditions.findFirst({ where: { company_id: BigInt(companyId) } });
            if (terms) {
                terms = await this.prisma.client.terms_conditions.update({ where: { id: terms.id }, data: { content: createTermsConditionsDto.content || '' } });
                await this.logService.createLogForUserAction(Number(user.id), 'terms_conditions', Number(terms.id), 'update', 'Terms & Conditions updated:' + terms.id);
            } else {
                try {
                    const maxIdResult = await this.prisma.client.terms_conditions.aggregate({ _max: { id: true } });
                    const nextId = maxIdResult._max.id ? BigInt(maxIdResult._max.id) + BigInt(1) : BigInt(1);
                    terms = await this.prisma.client.terms_conditions.create({ data: { id: nextId, content: createTermsConditionsDto.content || '', company_id: BigInt(companyId) } });
                } catch (createError) {
                    terms = await this.prisma.client.terms_conditions.findFirst({ where: { company_id: BigInt(companyId) } });
                    if (terms) { terms = await this.prisma.client.terms_conditions.update({ where: { id: terms.id }, data: { content: createTermsConditionsDto.content || '' } }); } else { throw createError; }
                }
                await this.logService.createLogForUserAction(Number(user.id), 'terms_conditions', Number(terms.id), 'create', 'Terms & Conditions created/updated:' + terms.id);
            }
            return terms;
        } catch (error) { throw new BadRequestException('Error creating/updating Terms & Conditions: ' + error.message); }
    }
    async findTermsConditionsByCompany(currentUser: number) {
        try {
            const user = await this.prisma.client.users.findUnique({ where: { id: Number(currentUser) } });
            if (!user) { throw new BadRequestException('User not found'); }
            let terms;
            if (user.role_id?.toString() === '1') { terms = await this.prisma.client.terms_conditions.findMany({}); }
            else if (user.role_id?.toString() === '2') { terms = await this.prisma.client.terms_conditions.findMany({ where: { OR: [{ company_id: user.company_id }, { company_id: null }] } }); }
            else { terms = await this.prisma.client.terms_conditions.findMany({ where: { company_id: user.company_id } }); }
            if (terms.length > 0) {
                for (let i = 0; i < terms.length; i++) {
                    const created_at = await this.prisma.client.logs.findFirst({ where: { action: 'create', entity: 'terms_conditions', row_id: terms[i].id } });
                    terms[i].created_at = created_at?.created_at;
                    const updated_at = await this.prisma.client.logs.findFirst({ where: { action: 'update', entity: 'terms_conditions', row_id: terms[i].id } });
                    terms[i].updated_at = updated_at?.created_at;
                }
            }
            return terms;
        } catch (error) { throw new BadRequestException('Error getting Terms & Conditions: ' + error.message); }
    }
    async findOneTermsConditions(id: number, currentUser: number) {
        try {
            const user = await this.prisma.client.users.findUnique({ where: { id: Number(currentUser) } });
            if (!user) { throw new BadRequestException('User not found'); }
            const terms = await this.prisma.client.terms_conditions.findUnique({ where: { id } });
            if (!terms) { throw new BadRequestException('Terms & Conditions not found'); }
            if (user.role_id?.toString() !== '1' && user.role_id?.toString() !== '2' && terms.company_id?.toString() !== user.company_id?.toString()) { throw new BadRequestException('You do not have permission to view this Terms & Conditions'); }
            return terms;
        } catch (error) { throw new BadRequestException('Error getting Terms & Conditions: ' + error.message); }
    }
    async updateTermsConditions(id: number, updateTermsConditionsDto: UpdateTermsConditionsDto, currentUser: number) {
        try {
            const user = await this.prisma.client.users.findUnique({ where: { id: Number(currentUser) } });
            if (!user) { throw new BadRequestException('User not found'); }
            const existingTerms = await this.prisma.client.terms_conditions.findUnique({ where: { id } });
            if (!existingTerms) { throw new BadRequestException('Terms & Conditions not found'); }
            if (user.role_id?.toString() !== '1' && user.role_id?.toString() !== '2' && existingTerms.company_id?.toString() !== (user.company_id?.toString() || '')) { throw new BadRequestException('You do not have permission to update this Terms & Conditions'); }
            const updateData: any = { ...updateTermsConditionsDto };
            if (user.role_id?.toString() === '2' && existingTerms.company_id === null && updateData.companyId !== undefined) { updateData.companyId = null; }
            const companyIdValue = user.role_id?.toString() === '1' || user.role_id?.toString() === '2' ? (updateData.companyId !== undefined ? updateData.companyId : existingTerms.company_id) : user.company_id;
            const result = await this.prisma.client.terms_conditions.update({ where: { id }, data: { content: updateData.content || '', company_id: companyIdValue } });
            await this.logService.createLogForUserAction(Number(user.id), 'terms_conditions', id, 'update', 'Terms & Conditions updated:' + id);
            return result;
        } catch (error) { throw new BadRequestException('Error updating Terms & Conditions: ' + error.message); }
    }
    async deleteTermsConditions(id: number, currentUser: number) {
        try {
            const user = await this.prisma.client.users.findUnique({ where: { id: Number(currentUser) } });
            if (!user) { throw new BadRequestException('User not found'); }
            const existingTerms = await this.prisma.client.terms_conditions.findUnique({ where: { id } });
            if (!existingTerms) { throw new BadRequestException('Terms & Conditions not found'); }
            if (user.role_id?.toString() === '2' && user.company_id) {
                if (existingTerms?.company_id && existingTerms?.company_id?.toString() !== user.company_id?.toString()) { throw new BadRequestException('You are not authorized to delete this Terms & Conditions'); }
            } else if (user.role_id?.toString() !== '1' && existingTerms.company_id?.toString() !== (user.company_id?.toString() || '')) { throw new BadRequestException('You are not authorized to delete this Terms & Conditions'); }
            const result = await this.prisma.client.terms_conditions.delete({ where: { id } });
            await this.logService.createLogForUserAction(Number(user.id), 'terms_conditions', id, 'delete', 'Terms & Conditions deleted:' + id);
            return result;
        } catch (error) { throw new BadRequestException('Error deleting Terms & Conditions: ' + error.message); }
    }
}