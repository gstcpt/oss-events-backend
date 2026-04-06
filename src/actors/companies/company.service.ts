import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { LogService } from "../../common/services/log.service";

@Injectable()
export class CompanyService {
    constructor(private prisma: PrismaService, private logService: LogService) { }
    async createCompany(createCompanyDto: CreateCompanyDto, currentUser: any) {
        try {
            const data: any = {
                admin_id: createCompanyDto.admin_id ? BigInt(createCompanyDto.admin_id) : undefined,
                title: createCompanyDto.title,
                url: createCompanyDto.url,
                logo: createCompanyDto.logo,
                favicon: createCompanyDto.favicon,
                matricule: createCompanyDto.matricule,
                domain: createCompanyDto.domain,
                date_foundation: createCompanyDto.date_foundation ? new Date(createCompanyDto.date_foundation) : undefined,
                description: createCompanyDto.description,
                contact: createCompanyDto.contact,
                tel: createCompanyDto.tel,
                email: createCompanyDto.email,
                address: createCompanyDto.address,
                country_id: createCompanyDto.country_id ? Number(createCompanyDto.country_id) : undefined,
                governorat_id: createCompanyDto.governorat_id ? Number(createCompanyDto.governorat_id) : undefined,
                municipality_id: createCompanyDto.municipality_id ? Number(createCompanyDto.municipality_id) : undefined,
                status: createCompanyDto.status ? Number(createCompanyDto.status) : undefined,
                facebook: createCompanyDto.facebook,
                instagram: createCompanyDto.instagram,
                tiktok: createCompanyDto.tiktok,
                linkedin: createCompanyDto.linkedin,
                twitter: createCompanyDto.twitter,
                youtube: createCompanyDto.youtube,
            };
            const result = await this.prisma.client.companies.create({ data });
            await this.logService.createLogForUserAction(Number(currentUser.id), 'companies', Number(result.id), 'create', `Company created: ${result.title}`);
            return result;
        } catch (error) { throw new BadRequestException('Error creating company'); }
    }
    async findCompanyById(id: bigint) {
        try {
            return this.prisma.client.companies.findUnique({ where: { id }, include: { admin: true } });
        } catch (error) { throw new BadRequestException('No company found with this ID'); }
    }
    async findAllCompanies(user: any) {
        try {
            if (!user) { throw new BadRequestException('User not found'); }
            if (user.company_id === null) { return this.prisma.client.companies.findMany({ include: { admin: true } }); }
            return this.prisma.client.companies.findMany({ where: { id: user.company_id }, include: { admin: true } });
        } catch (error) { throw new BadRequestException("Error fetching companies"); }
    }
    async countAllCompanies() { try { return this.prisma.client.companies.count(); } catch (error) { throw new BadRequestException('Error counting companies'); } }
    async findCompanyByUserId(id: number) { try { return this.prisma.client.companies.findMany({ where: { admin_id: Number(id) } }); } catch (error) { throw new BadRequestException('Error fetching companies by user ID'); } }
    async findCompanyByUrl(url: string) { try { return this.prisma.client.companies.findFirst({ where: { url }, include: { admin: true } }); } catch (error) { throw new BadRequestException('Error fetching company by URL'); } }
    async findAllCompanyByStatus(status: number) { try { return this.prisma.client.companies.findMany({ where: { status } }); } catch (error) { throw new BadRequestException('Error fetching companies by status'); } }
    async updateCompany(id: bigint, updateCompanyDto: UpdateCompanyDto, currentUser: any) {
        try {
            const data: any = {};
            if (updateCompanyDto.title !== undefined) data.title = updateCompanyDto.title;
            if (updateCompanyDto.url !== undefined) data.url = updateCompanyDto.url;
            if (updateCompanyDto.admin_id !== undefined) data.admin_id = updateCompanyDto.admin_id ? BigInt(updateCompanyDto.admin_id) : null;
            if (updateCompanyDto.logo !== undefined) data.logo = updateCompanyDto.logo;
            if (updateCompanyDto.favicon !== undefined) data.favicon = updateCompanyDto.favicon;
            if (updateCompanyDto.matricule !== undefined) data.matricule = updateCompanyDto.matricule;
            if (updateCompanyDto.domain !== undefined) data.domain = updateCompanyDto.domain;
            if (updateCompanyDto.date_foundation !== undefined) {
                const date = new Date(updateCompanyDto.date_foundation);
                data.date_foundation = isNaN(date.getTime()) ? null : date;
            }
            if (updateCompanyDto.description !== undefined) data.description = updateCompanyDto.description;
            if (updateCompanyDto.contact !== undefined) data.contact = updateCompanyDto.contact;
            if (updateCompanyDto.tel !== undefined) data.tel = updateCompanyDto.tel;
            if (updateCompanyDto.email !== undefined) data.email = updateCompanyDto.email;
            if (updateCompanyDto.address !== undefined) data.address = updateCompanyDto.address;
            if (updateCompanyDto.country_id !== undefined) data.country_id = updateCompanyDto.country_id ? Number(updateCompanyDto.country_id) : null;
            if (updateCompanyDto.governorat_id !== undefined) data.governorat_id = updateCompanyDto.governorat_id ? Number(updateCompanyDto.governorat_id) : null;
            if (updateCompanyDto.municipality_id !== undefined) data.municipality_id = updateCompanyDto.municipality_id ? Number(updateCompanyDto.municipality_id) : null;
            if (updateCompanyDto.status !== undefined) data.status = Number(updateCompanyDto.status);
            if (updateCompanyDto.facebook !== undefined) data.facebook = updateCompanyDto.facebook;
            if (updateCompanyDto.instagram !== undefined) data.instagram = updateCompanyDto.instagram;
            if (updateCompanyDto.tiktok !== undefined) data.tiktok = updateCompanyDto.tiktok;
            if (updateCompanyDto.linkedin !== undefined) data.linkedin = updateCompanyDto.linkedin;
            if (updateCompanyDto.twitter !== undefined) data.twitter = updateCompanyDto.twitter;
            if (updateCompanyDto.youtube !== undefined) data.youtube = updateCompanyDto.youtube;

            const result = await this.prisma.client.companies.update({ where: { id }, data });
            await this.logService.createLogForUserAction(Number(currentUser.id), 'companies', Number(id), 'update', `Company updated: ${result.title}`);
            return result;
        } catch (error) { throw new BadRequestException('Error updating company: ' + error.message); }
    }
    async removeCompany(id: bigint, currentUser: any) {
        try {
            const company = await this.prisma.client.companies.delete({ where: { id } });
            await this.logService.createLogForUserAction(Number(currentUser.id), 'companies', Number(id), 'delete', `Company deleted: ${company.title}`);
            return ({ message: 'Company deleted successfully', company });
        } catch (error) { throw new BadRequestException('Error deleting company'); }
    }
}