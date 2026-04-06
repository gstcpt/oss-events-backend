import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCompanySettingsDto } from './dto/create-company-settings.dto';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';
import { LogService } from '../../../common/services/log.service';

@Injectable()
export class CompanySettingsService {
  constructor(private prisma: PrismaService, private logService: LogService) { }
  async create(createCompanySettingsDto: CreateCompanySettingsDto, currentUser: any) {
    try {
      const company_settings = await this.prisma.client.company_settings.create({ data: createCompanySettingsDto });
      await this.logService.createLogForUserAction(Number(currentUser.id), 'company_settings', Number(company_settings.id), 'create', `Company settings created: ${company_settings.custom_value}`);
      return company_settings;
    } catch (error) { throw new BadRequestException('Error creating company settings', error.message); }
  }
  async findAll() {return this.prisma.client.company_settings.findMany();}
  async findByCompanyId(companyId: number) {return this.prisma.client.company_settings.findMany({where: { company_id: companyId }, include: {app_settings: true}});}
  async findOne(id: number) {return this.prisma.client.company_settings.findUnique({where: { id }});}

  async update(id: number, updateCompanySettingsDto: UpdateCompanySettingsDto, currentUser: any) {
    try {
      const company_settings = await this.prisma.client.company_settings.update({where: { id }, data: updateCompanySettingsDto});
      await this.logService.createLogForUserAction(Number(currentUser.id), 'company_settings', Number(company_settings.id), 'update', `Company settings updated: ${company_settings.custom_value}`);
      return company_settings;
    } catch (error) { throw new BadRequestException('Error updating company settings', error.message); }
  }

  async remove(id: number, currentUser: any) {
    try {
      const company_settings = await this.prisma.client.company_settings.delete({where: { id }});
      await this.logService.createLogForUserAction(Number(currentUser.id), 'company_settings', Number(company_settings.id), 'delete', `Company settings deleted: ${company_settings.custom_value}`);
      return company_settings;
    } catch (error) { throw new BadRequestException('Error deleting company settings', error.message); }
  }
}